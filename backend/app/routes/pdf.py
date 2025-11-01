import logging
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from sqlalchemy import event, select
from sqlalchemy.engine import Engine
from app.core.database import get_db
from app.models.invoice import Invoice
from app.models.contract import Contract
from app.models.client import Client
from app.models.contract_detail import ContractDetail
from app.models.facture import Facture
from app.models.estimate import Estimate
from app.schemas.facture import Facture as FactureSchema
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import datetime, timedelta
import os

# Helper to format quantity with a unit label like "432 unités", "1 unité", "100 m", "2 ensembles"
def format_qty(qty, unit: str) -> str:
    unit_key = (unit or "unite").lower()
    if unit_key in ["unite", "unité", "unity", "unit"]:
        label = "unité" if float(qty) == 1 else "unités"
    elif unit_key in ["ensemble", "set"]:
        label = "ensemble" if float(qty) == 1 else "ensembles"
    else:  # meters or other
        label = "m"
    try:
        # Render 1 without trailing .0, keep integers clean
        qty_str = ("%g" % float(qty))
    except Exception:
        qty_str = str(qty)
    return f"{qty_str} {label}"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('pdf_generation.log')
    ]
)
logger = logging.getLogger(__name__)

# SQL query logging
@event.listens_for(Engine, 'before_cursor_execute')
def receive_before_cursor_execute(conn, cursor, statement, params, context, executemany):
    if not statement.startswith('SELECT 1'):  # Ignore connection test queries
        logger.info(f"\n--- SQL QUERY ---\n{statement}")
        if params:
            logger.info(f"Parameters: {params}")

@event.listens_for(Engine, 'after_cursor_execute')
def receive_after_cursor_execute(conn, cursor, statement, params, context, executemany):
    if not statement.startswith('SELECT 1'):
        if cursor.rowcount >= 0:
            logger.info(f"Rows affected: {cursor.rowcount}")
        if cursor.description:
            columns = [desc[0] for desc in cursor.description]
            logger.info(f"Returned columns: {columns}")

router = APIRouter(prefix="/pdf", tags=["pdf"])

# Canvas subclass to add page X/Y footer with doc number
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, footer_left: str = "", doc_number: str = "", **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []
        self._footer_left = footer_left
        self._doc_number = doc_number

    def showPage(self):
        # Save the current page state but do NOT finalize the page yet with showPage
        self._saved_page_states.append(dict(self.__dict__))
        # Start a new page without emitting one to the output yet
        self._startPage()

    def save(self):
        # Include the current (last) page state
        self._saved_page_states.append(dict(self.__dict__))
        total_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_footer(total_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def _draw_footer(self, total_pages: int):
        # Footer styling
        left_margin = 40
        right_margin_x = 570  # approx page width - 42
        y = 30
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillGray(0.35)
        # Left text
        if self._footer_left:
            self.drawString(left_margin, y, self._footer_left)
        # Right text: DOCNUM · page/total
        try:
            page_num = self.getPageNumber()
        except Exception:
            page_num = 1
        right_text = ""
        if self._doc_number:
            right_text = f"{self._doc_number}  ·  {page_num}/{total_pages}"
        else:
            right_text = f"{page_num}/{total_pages}"
        self.drawRightString(right_margin_x, y, right_text)
        self.restoreState()

@router.get("/generate_devis")
async def generate_devis_pdf_get(
    request: Request,
    name: str = "Devis",
    devis_number: str = None,
    expiration: str = None,
    creation_date: str = None,
    contract_id: int | None = None,
    db: Session = Depends(get_db)
):
    """
    Generate a Devis PDF from query parameters.
    This endpoint is kept for backward compatibility with the frontend.
    """
    from urllib.parse import unquote
    
    # Parse query parameters
    query_params = dict(request.query_params)
    
    # Log incoming request
    logger.info(f"Received PDF generation request with params: {query_params}")
    
    # Debug: Print all query parameters
    logger.info("\n=== Raw Query Parameters ===")
    for key, value in query_params.items():
        logger.info(f"{key}: {value}")
        
    # Extract client info (support alternate keys from UI)
    client = {}
    items = []
    
    # Extract client info (support alternate keys from UI)
    client_keys = ['name', 'email', 'phone', 'tva', 'tsa_number', 'client_address']
    for key in client_keys:
        param_key = f'client[{key}]'
        if param_key in query_params:
            client[key] = query_params[param_key]
    # Alternate names coming from UI: client_name -> name, tva_number -> tva
    alt_name = query_params.get('client[client_name]')
    if alt_name and not client.get('name'):
        client['name'] = alt_name
    alt_tva = query_params.get('client[tva_number]')
    if alt_tva and not client.get('tva'):
        client['tva'] = alt_tva

    # Enrich missing client fields (especially name) from DB
    try:
        if not client.get('name'):
            # 0) If devis_number is provided, resolve client via Estimate
            if devis_number:
                est = db.execute(select(Estimate).where(Estimate.estimate_number == devis_number)).scalars().first()
                if est:
                    db_client = db.execute(select(Client).where(Client.id == est.client_id)).scalars().first()
                    if db_client:
                        client.setdefault('name', getattr(db_client, 'client_name', '') or '')
                        client.setdefault('email', getattr(db_client, 'email', '') or '')
                        client.setdefault('client_address', getattr(db_client, 'client_address', '') or '')
                        if not client.get('tva') and getattr(db_client, 'tva_number', None):
                            client['tva'] = db_client.tva_number
                        client.setdefault('tsa_number', getattr(db_client, 'tsa_number', '') or '')
            # 1) If contract_id provided, load client from contract
            if contract_id:
                contract_row = db.execute(select(Contract).where(Contract.id == int(contract_id))).scalars().first()
                if contract_row:
                    db_client = db.execute(select(Client).where(Client.id == contract_row.client_id)).scalars().first()
                    if db_client:
                        client.setdefault('name', getattr(db_client, 'client_name', '') or '')
                        client.setdefault('email', getattr(db_client, 'email', '') or '')
                        client.setdefault('client_address', getattr(db_client, 'client_address', '') or '')
                        # normalize TVA and SIRET
                        if not client.get('tva') and getattr(db_client, 'tva_number', None):
                            client['tva'] = db_client.tva_number
                        client.setdefault('tsa_number', getattr(db_client, 'tsa_number', '') or '')
            # 2) Else try lookup by SIRET/TSA number
            if not client.get('name') and client.get('tsa_number'):
                db_client = db.execute(select(Client).where(Client.tsa_number == client.get('tsa_number'))).scalars().first()
                if db_client:
                    client.setdefault('name', getattr(db_client, 'client_name', '') or '')
                    client.setdefault('email', getattr(db_client, 'email', '') or '')
                    client.setdefault('client_address', getattr(db_client, 'client_address', '') or '')
                    if not client.get('tva') and getattr(db_client, 'tva_number', None):
                        client['tva'] = db_client.tva_number
            # 3) Else try lookup by email
            if not client.get('name') and client.get('email'):
                db_client = db.execute(select(Client).where(Client.email == client.get('email'))).scalars().first()
                if db_client:
                    client.setdefault('name', getattr(db_client, 'client_name', '') or '')
                    client.setdefault('client_address', getattr(db_client, 'client_address', '') or '')
                    if not client.get('tva') and getattr(db_client, 'tva_number', None):
                        client['tva'] = db_client.tva_number
                    client.setdefault('tsa_number', getattr(db_client, 'tsa_number', '') or '')
    except Exception as e:
        logger.warning(f"Failed to enrich client info for devis PDF: {e}")
            
    # Extract items (handle both indexed and non-indexed items)
    item_count = 0
    while True:
        item_found = False
        item = {}
        item_keys = ['description', 'qty', 'qty_unit', 'unit_price', 'tva', 'total_ht']
        
        for key in item_keys:
            # Try indexed parameter first (items[0][description])
            param_key = f'items[{item_count}][{key}]'
            if param_key in query_params:
                item[key] = query_params[param_key]
                item_found = True
                
        if not item_found and item_count == 0:
            # Try non-indexed parameters (items[description])
            for key in item_keys:
                param_key = f'items[{key}]'
                if param_key in query_params:
                    item[key] = query_params[param_key]
                    item_found = True
                    
        if not item_found:
            break
            
        # Convert numeric fields to appropriate types
        if 'qty' in item:
            try:
                item['qty'] = float(item['qty'])
            except (ValueError, TypeError):
                item['qty'] = 0.0
                
        if 'unit_price' in item:
            try:
                item['unit_price'] = float(item['unit_price'])
            except (ValueError, TypeError):
                item['unit_price'] = 0.0
                
        if 'tva' in item:
            try:
                item['tva'] = float(item['tva'])
            except (ValueError, TypeError):
                item['tva'] = 0.0
                
        if 'total_ht' in item:
            try:
                item['total_ht'] = float(item['total_ht'])
            except (ValueError, TypeError):
                item['total_ht'] = 0.0
            
        items.append(item)
        item_count += 1
        
    # If no items provided but a contract_id is available, load from ContractDetail
    if (not items) and contract_id:
        try:
            details = db.execute(select(ContractDetail).where(ContractDetail.contract_id == contract_id)).scalars().all()
            for d in details:
                items.append({
                    'description': getattr(d, 'description', '') or '',
                    'qty': float(getattr(d, 'qty', 0) or 0),
                    'qty_unit': getattr(d, 'qty_unit', 'unite') or 'unite',
                    'unit_price': float(getattr(d, 'unit_price', 0) or 0),
                    'tva': float(getattr(d, 'tva', 0) or 0),
                    'total_ht': float(getattr(d, 'total_ht', 0) or 0),
                })
        except Exception as e:
            logger.warning(f"Failed to load ContractDetail for contract_id={contract_id}: {e}")

    # Prepare payload for internal function
    payload = {
        'name': name,
        'devis_number': devis_number,
        'expiration': expiration,
        'creation_date': creation_date,
        'client': client,
        'items': items,
        'contract_id': contract_id
    }
    
    logger.info("\n=== Final Payload ===")
    logger.info(payload)
    
    # Call the internal function with the parsed payload
    return await generate_devis_pdf(payload)

@router.get("/invoice/{invoice_id}")
async def generate_invoice_pdf(
    invoice_id: str, 
    invoice_number: str = None,
    issue_date: str = None,
    expiration_date: str = None,
    db: Session = Depends(get_db)
):
    from reportlab.lib.utils import ImageReader
    import os
    import re

    logger.info(f"\n=== Starting PDF Generation for Invoice ID: {invoice_id} ===")
    
    # Extract numeric ID if the input has "INV-" prefix
    numeric_id = invoice_id
    if isinstance(invoice_id, str) and invoice_id.startswith("INV-"):
        numeric_id = re.sub(r'^INV-', '', invoice_id)
    
    try:
        numeric_id = int(numeric_id)
    except (ValueError, TypeError):
        logger.error(f"Invalid invoice ID format: {invoice_id}")
        raise HTTPException(status_code=400, detail="Invalid invoice ID format. Expected format: number or 'INV-{number}'")
    
    # Log the SQL query for invoice
    logger.info("\n[1/3] Fetching invoice data...")
    result = db.execute(select(Invoice).where(Invoice.id == numeric_id))
    invoice = result.scalars().first()
    if not invoice:
        logger.error(f"Invoice with ID {numeric_id} not found")
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    logger.info(f"Found invoice: ID={invoice.id}, Contract ID={invoice.contract_id}")
    # Fetch the related contract (needed for dates and contract details)
    logger.info("\n[2/3] Fetching contract data...")
    contract_result = db.execute(select(Contract).where(Contract.id == invoice.contract_id))
    contract = contract_result.scalars().first()
    if not contract:
        logger.error(f"Contract with ID {invoice.contract_id} not found for invoice {invoice_id}")
        raise HTTPException(status_code=404, detail="Contract not found for invoice")

    # Log the SQL query for factures - prefer invoice-linked, fallback to contract-linked
    logger.info("\n[3/3] Fetching factures data...")
    factures_result = db.execute(select(Facture).where(Facture.invoice_id == invoice.id))
    factures = factures_result.scalars().all()
    logger.info(f"Found {len(factures)} facture(s) linked to invoice for rendering")
    
    # Log detailed facture information
    logger.info("\n=== FACTURE DETAILS ===")
    for i, facture in enumerate(factures, 1):
        logger.info(f"Facture #{i}:")
        logger.info(f"  ID: {facture.id}")
        logger.info(f"  Description: {facture.description}")
        logger.info(f"  Quantity: {facture.qty}")
        logger.info(f"  Unit Price: {facture.unit_price} €")
        logger.info(f"  TVA: {facture.tva}%")
        logger.info(f"  Total HT: {facture.total_ht} €")
        logger.info(f"  Created At: {facture.created_at}")
    logger.info("=====================\n")
    
    # Get client data (from contract's client_id)
    client_result = db.execute(select(Client).where(Client.id == contract.client_id))
    client = client_result.scalars().first()
    if client:
        logger.info(f"Found client: ID={client.id}, Name={client.client_name}")
    else:
        logger.warning("No client found for this invoice")

    buffer = BytesIO()
    # Use NumberedCanvas with footer; set doc number after computing invoice_num
    footer_left_text = "NEXT NR-GIE, SAS avec un capital de 5 000,00 € • 930 601 547 Evry B"
    p = NumberedCanvas(buffer, pagesize=letter, footer_left=footer_left_text, doc_number="")

    # Page-break helper (align with old template)
    def ensure_space(current_y: int, min_y: int = 140) -> int:
        if current_y < min_y:
            p.showPage()
            return 760
        return current_y

    # Margins and layout
    left = 40
    right = 320
    y = 740
    line_height = 22

    # Title
    p.setFont("Helvetica-Bold", 28)
    p.drawString(left, y, "Facture")
    y -= 2 * line_height

    # Invoice info (left col)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(left, y, "Numéro de facture")
    p.setFont("Helvetica", 12)
    # Use provided invoice number, else DB value, else auto-generated
    try:
        db_invoice_number = getattr(invoice, 'invoice_number', None)
    except Exception:
        db_invoice_number = None
    invoice_num = invoice_number or db_invoice_number or datetime.now().strftime('%Y%m%d')
    p.drawString(left + 170, y, f"{invoice_num}")
    # Update footer doc number (shown at right with page x/y)
    try:
        p._doc_number = str(invoice_num)
    except Exception:
        pass
    y -= line_height
    
    # Get dates from parameters or fall back to invoice fields then contract
    def to_ddmmyyyy(dt):
        try:
            return dt.strftime('%d/%m/%Y') if dt else ''
        except Exception:
            return ''
    
    # Issue date
    if issue_date:
        try:
            issue_date_dt = datetime.strptime(issue_date, '%Y-%m-%d')
            issue_date_str = issue_date_dt.strftime('%d/%m/%Y')
        except ValueError:
            issue_date_str = datetime.now().strftime('%d/%m/%Y')
    else:
        # Prefer invoice.created_at if available, else contract.date, else today
        created_at = getattr(invoice, 'created_at', None)
        if created_at:
            try:
                issue_date_str = to_ddmmyyyy(created_at)
            except Exception:
                issue_date_str = datetime.now().strftime('%d/%m/%Y')
        else:
            issue_date_str = contract.date.strftime('%d/%m/%Y') if hasattr(contract, 'date') and contract.date else datetime.now().strftime('%d/%m/%Y')
    
    # Expiration date
    if expiration_date:
        try:
            exp_date_dt = datetime.strptime(expiration_date, '%Y-%m-%d')
            expiration_date_str = exp_date_dt.strftime('%d/%m/%Y')
        except ValueError:
            expiration_date_str = (datetime.now() + timedelta(days=30)).strftime('%d/%m/%Y')
    else:
        # Prefer invoice.due_date if available, else contract.deadline, else +30 days
        due_date = getattr(invoice, 'due_date', None)
        if due_date:
            try:
                expiration_date_str = to_ddmmyyyy(due_date)
            except Exception:
                expiration_date_str = (datetime.now() + timedelta(days=30)).strftime('%d/%m/%Y')
        else:
            expiration_date_str = contract.deadline.strftime('%d/%m/%Y') if hasattr(contract, 'deadline') and contract.deadline else (datetime.now() + timedelta(days=30)).strftime('%d/%m/%Y')
    
    # Draw issue date
    p.setFont("Helvetica-Bold", 12)
    p.drawString(left, y, "Date d'émission")
    p.setFont("Helvetica", 12)
    p.drawString(left + 170, y, issue_date_str)
    y -= line_height
    
    # Draw expiration date
    p.setFont("Helvetica-Bold", 12)
    p.drawString(left, y, "Date d'expiration")
    p.setFont("Helvetica", 12)
    p.drawString(left + 170, y, expiration_date_str)
    y -= line_height
    
    # Numéro de contrat
    p.setFont("Helvetica-Bold", 11)
    p.drawString(left, y, "Numéro de contrat")
    p.setFont("Helvetica", 12)
    p.drawString(left + 170, y, f"{contract.command_number}" if hasattr(contract, 'command_number') else "")
    y -= line_height
    


    # Logo (top right)
    logo_y = 700
    logo_x = 440
    logo_width = 150
    logo_height = 55
    # Resolve logo from multiple possible locations to work across environments
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    candidate_paths = [
        os.path.join(base_dir, "app", "static", "logonr.jpg"),
        os.path.join(base_dir, "..", "frontend", "public", "logonr.jpg"),
    ]
    logo_path = None
    for pth in candidate_paths:
        if os.path.exists(pth):
            logo_path = pth
            break
    if logo_path:
        p.drawImage(ImageReader(logo_path), logo_x, logo_y, width=logo_width, height=logo_height, mask='auto')
    else:
        logger.warning(f"Logo not found. Tried: {candidate_paths}")

    # Addresses and info
    y -= 2 * line_height
    left_col_y = y
    right_col_y = y
    # LEFT: Supplier
    p.setFont("Helvetica-Bold", 11)
    p.drawString(left, left_col_y, "NEXT NR–GIE")
    p.setFont("Helvetica", 10)
    p.drawString(left, left_col_y - 15, "2 Rue Des Frênes")
    p.drawString(left, left_col_y - 30, "91100 Corbeil-Essonnes, FR")
    p.drawString(left, left_col_y - 45, "nextrngie@gmail.com")
    p.drawString(left, left_col_y - 60, "93060154700019")
    p.drawString(left, left_col_y - 75, "Numéro de TVA: FR26930601547")

    # RIGHT: Client
    p.setFont("Helvetica-Bold", 11)
    client_result = db.execute(select(Client).where(Client.id == contract.client_id))
    client = client_result.scalars().first()
    
    if client:
        # Draw client name with word wrapping
        y_pos = right_col_y
        name_text = (client.client_name or "").strip()
        p.setFont("Helvetica-Bold", 11)
        if name_text:
            max_width = 200
            words = name_text.split()
            line = ""
            lines = []
            for w in words:
                test = (line + (" " if line else "") + w)
                if p.stringWidth(test, "Helvetica-Bold", 11) <= max_width:
                    line = test
                else:
                    if line:
                        lines.append(line)
                    line = w
            if line:
                lines.append(line)
            for ln in lines:
                p.drawString(right, y_pos, ln)
                y_pos -= 15
        else:
            p.drawString(right, y_pos, "Client")
            y_pos -= 15
        
        # Details
        p.setFont("Helvetica", 10)
        
        # Address (multi-line)
        addr = getattr(client, 'client_address', None)
        if addr:
            for line_txt in str(addr).replace('\r\n','\n').replace('\r','\n').split('\n'):
                if line_txt.strip():
                    p.drawString(right, y_pos, line_txt.strip())
                    y_pos -= 15
        # SIRET from TSA number (if available)
        if getattr(client, 'tsa_number', None):
            p.drawString(right, y_pos, f"SIRET: {client.tsa_number}")
            y_pos -= 15
        
        # Email (keep if available)
        if getattr(client, 'email', None):
            p.drawString(right, y_pos, client.email)
            y_pos -= 15
        
        # TVA number
        if getattr(client, 'tva_number', None):
            p.drawString(right, y_pos, f"Numéro de TVA: {client.tva_number}")
    else:
        p.drawString(right, right_col_y, "Client")
        p.setFont("Helvetica", 10)
        p.drawString(right, right_col_y - 15, "")
        p.drawString(right, right_col_y - 30, "")
        p.drawString(right, right_col_y - 45, "")

    # Chantier (site/project)
    # Anchor the table safely below the address blocks to prevent overlap
    # Estimate bottoms of both columns and position the table below the lowest point
    left_bottom = left_col_y - 90
    right_bottom = right_col_y - 120
    y_after_blocks = min(left_bottom, right_bottom) - 10
    chantier_y = y_after_blocks

    # Add table header below chantier
    table_y = chantier_y - 30  # Position below chantier
    table_header_y = table_y + 20
    
    # Draw header line with reduced spacing
    p.setLineWidth(0.5)  # Thinner line for header
    p.line(40, table_header_y, 550, table_header_y)
    
    # Table headers
    p.setFont("Helvetica-Bold", 10)
    
    headers = [
        {"text": "Description", "width": 250},  
        {"text": "Qté", "width": 70},       
        {"text": "Prix unitaire", "width": 100},  
        {"text": "TVA (%)", "width": 60},    
        {"text": "Total HT", "width": 60}     
    ]
    
    # Calculate total width of all headers
    total_width = sum(header["width"] for header in headers)
    
    # Calculate centered position
    page_width = 550  # Page width from 40 to 550
    header_x = (page_width - total_width) / 2 + 40  # Centered position
    
    # Draw black background for entire header area
    p.setLineWidth(0.7)
    p.setFillColorRGB(0, 0, 0)  # Black
    p.rect(header_x, table_header_y - 20, total_width, 20, fill=1)
    
    # Draw white text
    p.setFillColorRGB(1, 1, 1)  # White
    current_x = header_x
    for header in headers:
        if header["text"] == "Total HT":
            # Right-align Total HT
            text_width = p.stringWidth(header["text"], "Helvetica-Bold", 10)
            p.drawString(current_x + header["width"] - text_width - 5, table_header_y - 15, header["text"])
        else:
            # Left-align other columns
            p.drawString(current_x + 5, table_header_y - 15, header["text"])
        current_x += header["width"]
    
    # Prepare for dynamic per-page borders
    # Column X positions (including left and right boundaries)
    col_x = [header_x]
    for h in headers:
        col_x.append(col_x[-1] + h["width"])
    # Track top Y of the table area on the current page
    page_top = table_header_y
    # Stroke/text colors
    p.setStrokeColorRGB(0, 0, 0)
    p.setFillColorRGB(0, 0, 0)

    # Helper: close current page table borders
    def close_table_borders(top_y: float, bottom_y: float):
        p.setLineWidth(0.7)
        for x in col_x:  # draw all verticals including rightmost
            p.line(x, top_y, x, bottom_y)
        # bottom line
        p.line(header_x, bottom_y, header_x + total_width, bottom_y)
    
    # Draw factures in the table (items for THIS invoice)
    row_height = 18  # Reduced row height for more compact rows
    y_position = table_header_y - 15  # Reduced spacing after header
    total_ht_sum = 0.0
    tva_sum = 0.0
    
    if factures:
        for detail in factures:
            # Check if we need a new page
            if y_position < 100:  # If too close to bottom, close borders and start a new page
                close_table_borders(page_top, y_position)
                p.showPage()
                p.setFont("Helvetica", 10)
                y_position = 750  # Reset y position for new page
                
                # Redraw header on new page
                p.setLineWidth(0.7)
                p.setFillColorRGB(0, 0, 0)  # Black
                p.rect(header_x, y_position, total_width, 20, fill=1)
                p.setFillColorRGB(1, 1, 1)  # White
                current_x = header_x
                for header in headers:
                    if header["text"] == "Total HT":
                        text_width = p.stringWidth(header["text"], "Helvetica-Bold", 10)
                        p.drawString(current_x + header["width"] - text_width - 5, y_position - 15, header["text"])
                    else:
                        p.drawString(current_x + 5, y_position - 15, header["text"])
                    current_x += header["width"]
                y_position -= 20
                # Reset page_top for the new page
                page_top = y_position + 20
                p.setFillColorRGB(0, 0, 0)  # Reset to black for content
            
            # Draw row data
            current_x = header_x
            p.setFont("Helvetica", 9)
            
            # Description with word wrapping
            desc = str(detail.description or '')
            max_width = headers[0]["width"] - 10  # 5px padding on each side
            words = desc.split()
            lines = []
            current_line = []
            
            for word in words:
                test_line = ' '.join(current_line + [word])
                if p.stringWidth(test_line, "Helvetica", 9) <= max_width:
                    current_line.append(word)
                else:
                    if current_line:
                        lines.append(' '.join(current_line))
                    current_line = [word]
            if current_line:
                lines.append(' '.join(current_line))
                
            # Draw each line of the description
            line_height = 12
            desc_y = y_position - 10  # Start a bit higher to center the text
            for i, line in enumerate(lines):
                if i > 0:  # If we need to add more lines
                    y_position -= line_height
                    # Check if we need a new page
                    if y_position < 100:
                        close_table_borders(page_top, y_position + line_height)
                        p.showPage()
                        p.setFont("Helvetica", 10)
                        y_position = 750
                        # Redraw header on new page
                        p.setLineWidth(0.7)
                        p.setFillColorRGB(0, 0, 0)
                        p.rect(header_x, y_position, total_width, 20, fill=1)
                        p.setFillColorRGB(1, 1, 1)
                        current_x_header = header_x
                        for header in headers:
                            if header["text"] == "Total HT":
                                text_width = p.stringWidth(header["text"], "Helvetica-Bold", 10)
                                p.drawString(current_x_header + header["width"] - text_width - 5, y_position - 15, header["text"])
                            else:
                                p.drawString(current_x_header + 5, y_position - 15, header["text"])
                            current_x_header += header["width"]
                        y_position -= 20
                        page_top = y_position + 20
                        p.setFillColorRGB(0, 0, 0)
                        desc_y = y_position - 10
                
                p.drawString(header_x + 5, desc_y, line)
                desc_y -= line_height
                
            # Adjust y_position based on number of lines with reduced spacing
            if len(lines) > 1:
                y_position -= (len(lines) - 1) * (line_height - 2)  # Reduced line spacing
            current_x += headers[0]["width"]
            
            # Quantity with unit (e.g., "432 unités", "100 m")
            qty_text = format_qty(detail.qty, getattr(detail, 'qty_unit', 'unite'))
            qty_width = p.stringWidth(qty_text, "Helvetica", 9)
            p.drawString(current_x + headers[1]["width"] - qty_width - 5, y_position - 15, qty_text)
            current_x += headers[1]["width"]
            
            # Unit Price
            unit_price_text = f"€ {detail.unit_price:.2f}"
            unit_price_width = p.stringWidth(unit_price_text, "Helvetica", 9)
            p.drawString(current_x + headers[2]["width"] - unit_price_width - 5, y_position - 15, unit_price_text)
            current_x += headers[2]["width"]
            
            # TVA from contract detail
            tva_rate = detail.tva if hasattr(detail, 'tva') else 0.0
            tva_text = f"{tva_rate:.2f}%"
            tva_width = p.stringWidth(tva_text, "Helvetica", 9)
            p.drawString(current_x + headers[3]["width"] - tva_width - 5, y_position - 15, tva_text)
            current_x += headers[3]["width"]
            
            # Total HT per row (exclude tax): qty * unit_price
            try:
                row_ht = float(detail.qty or 0) * float(detail.unit_price or 0)
            except Exception:
                row_ht = 0.0
            row_ht_text = f"€ {row_ht:.2f}"
            row_ht_width = p.stringWidth(row_ht_text, "Helvetica", 9)
            p.drawString(current_x + headers[4]["width"] - row_ht_width - 5, y_position - 15, row_ht_text)

            # Accumulate totals
            total_ht_sum += row_ht
            try:
                item_tva_rate = float(getattr(detail, 'tva', 0.0) or 0.0)
            except Exception:
                item_tva_rate = 0.0
            tva_sum += row_ht * (item_tva_rate / 100.0)
            
            # Draw horizontal line for this row with reduced spacing
            line_y = y_position - (row_height - 2)  # Slightly reduce the row height
            p.setLineWidth(0.3)  # Thinner line for row separators
            p.line(header_x, line_y, header_x + total_width, line_y)
            y_position = line_y  # Use the actual line position for next row
            
            # Move to next row
            y_position -= row_height
    else:
        # No items: don't render any placeholder rows; totals remain zero
        total_ht_sum = 0.0
        tva_sum = 0.0
    
    # Close borders for the final page section
    close_table_borders(page_top, y_position)
    
    # Add totals section
    y_position = ensure_space(y_position - 20, 160)
    p.setFont("Helvetica-Bold", 10)
    
    # Total HT
    p.drawString(header_x + 5, y_position - 15, "Total HT:")
    total_text = f"{total_ht_sum:.2f} €"
    total_width_text = p.stringWidth(total_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - total_width_text - 5, y_position - 15, total_text)
    
    # Calculate total TVA from all factures (sum of qty * unit_price * tva%)
    y_position = ensure_space(y_position - 20, 140)
    tva_amount = tva_sum
    p.drawString(header_x + 5, y_position - 15, "TVA:")
    tva_text = f"{tva_amount:.2f} €"
    tva_width_text = p.stringWidth(tva_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - tva_width_text - 5, y_position - 15, tva_text)
    
    # Total TTC (HT + TVA)
    y_position = ensure_space(y_position - 20, 140)
    total_ttc = total_ht_sum + tva_amount
    p.drawString(header_x + 5, y_position - 15, "Total TTC:")
    ttc_text = f"{total_ttc:.2f} €"
    ttc_width_text = p.stringWidth(ttc_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - ttc_width_text - 5, y_position - 15, ttc_text)
    
    # Legal notes and payment details (from old working template)
    y_position = ensure_space(y_position - 30, 200)
    p.setFont("Helvetica", 8)
    p.drawString(left, y_position, "TVA non applicable - Section 283 du CGI - Autoliquidation des services")
    y_position -= 12
    p.drawString(left, y_position, "Type de transaction : Services")
    y_position -= 12
    p.drawString(left, y_position, "Pas d'escompte accordé pour paiement anticipé.")
    y_position -= 12
    p.drawString(left, y_position, "En cas de non-paiement à la date d'échéance, des pénalités calculées à trois fois le taux d'intérêt légal seront appliquées.")
    y_position -= 12
    p.drawString(left, y_position, "Tout retard de paiement entraînera une indemnité forfaitaire pour frais de recouvrement de 40€.")
    
    # Spacing before payment details
    y_position -= (6 * 8)
    
    # Payment details
    y_position = ensure_space(y_position - 30, 150)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(left, y_position, "Détails du paiement")
    y_position -= 16
    p.setFont("Helvetica", 9)
    label_x = left
    value_x = left + 150
    p.drawString(label_x, y_position, "Nom du bénéficiaire")
    p.drawString(value_x, y_position, "NEXT NR-GIE")
    y_position -= 14
    p.drawString(label_x, y_position, "BIC")
    p.drawString(value_x, y_position, "CMCIFR2A")
    y_position -= 14
    p.drawString(label_x, y_position, "IBAN")
    p.drawString(value_x, y_position, "FR7610278062310002236670146")
    y_position -= 14
    # p.drawString(label_x, y_position, "Référence")
    # p.drawString(value_x, y_position, "QECVZDX")

    p.save()
    buffer.seek(0)
    return Response(buffer.read(), media_type="application/pdf", headers={"Content-Disposition": f"inline; filename=invoice_{datetime.now().strftime('%Y%m%d')}.pdf"})


@router.get("/estimate/{contract_id}")
def generate_estimate_pdf(contract_id: int, db: Session = Depends(get_db)):
    from reportlab.lib.utils import ImageReader
    import os
    
    result = db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalars().first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    client_result = db.execute(select(Client).where(Client.id == contract.client_id))
    client = client_result.scalars().first()
    
    buffer = BytesIO()
    footer_left_text = "NEXT NR-GIE, SAS avec un capital de 5 000,00 € • 930 601 547 Evry B"
    p = NumberedCanvas(buffer, pagesize=letter, footer_left=footer_left_text, doc_number="")
    
    # Page-break helper
    def ensure_space(current_y: int, min_y: int = 140) -> int:
        if current_y < min_y:
            p.showPage()
            return 760
        return current_y
    
    # Margins and layout
    left = 40
    right = 350
    y = 750
    line_height = 20
    
    # Title
    p.setFont("Helvetica-Bold", 24)
    p.drawString(left, y, "Facture")
    y -= line_height * 1.5
    
    # Invoice number (F + yyMMdd)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(left, y, "Numéro de facture")
    p.setFont("Helvetica", 12)
    invoice_no = f"F{datetime.now().strftime('%y%m%d')}"
    p.drawString(left + 170, y, invoice_no)
    y -= line_height
    
    # Dates
    start_date = contract.date.strftime('%d/%m/%Y') if hasattr(contract, 'date') else ''
    end_date = contract.deadline.strftime('%d/%m/%Y') if hasattr(contract, 'deadline') else ''
    
    p.setFont("Helvetica-Bold", 12)
    p.drawString(left, y, "Date d'émission")
    p.setFont("Helvetica", 12)
    p.drawString(left + 170, y, f"{start_date}")
    y -= line_height
    
    p.setFont("Helvetica-Bold", 12)
    p.drawString(left, y, "Date d'expiration")
    p.setFont("Helvetica", 12)
    p.drawString(left + 170, y, f"{end_date}")
    y -= line_height
    
    # Numéro de bon de commande
    p.setFont("Helvetica-Bold", 11)
    p.drawString(left, y, "Numéro de contrat")
    p.setFont("Helvetica", 12)
    p.drawString(left + 170, y, f"{contract.command_number}" if hasattr(contract, 'command_number') else '')
    y -= line_height
    
    # Logo (top right)
    logo_y = 700
    logo_x = 440
    logo_width = 150
    logo_height = 55
    # Use a relative path to the logo in the frontend public directory
    logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app", "static", "logonr.jpg")
    if os.path.exists(logo_path):
        p.drawImage(ImageReader(logo_path), logo_x, logo_y, width=logo_width, height=logo_height, mask='auto')
    else:
        print(f"Logo not found at: {logo_path}")
    
    # Addresses and info
    y -= 2 * line_height
    left_col_y = y
    right_col_y = y
    
    # LEFT: Supplier
    p.setFont("Helvetica-Bold", 11)
    p.drawString(left, left_col_y, "NEXT NR–GIE")
    p.setFont("Helvetica", 10)
    p.drawString(left, left_col_y - 15, "2 Rue Des Frênes")
    p.drawString(left, left_col_y - 30, "91100 Corbeil-Essonnes, FR")
    p.drawString(left, left_col_y - 45, "nextrngie@gmail.com")
    p.drawString(left, left_col_y - 60, "93060154700019")
    p.drawString(left, left_col_y - 75, "Numéro de TVA: FR26930601547")
    
    # Helper function to draw multi-line text
    def draw_multiline_text(text, x, y, line_height=15, max_width=200):
        if not text:
            return y
            
        lines = []
        # Split by newlines first
        paragraphs = text.split('\n')
        
        for para in paragraphs:
            words = para.split(' ') if para else ['']
            current_line = []
            
            for word in words:
                test_line = ' '.join(current_line + [word])
                if p.stringWidth(test_line, "Helvetica", 10) <= max_width or not current_line:
                    current_line.append(word)
                else:
                    lines.append(' '.join(current_line))
                    current_line = [word]
            
            if current_line:  # Add the last line of the paragraph
                lines.append(' '.join(current_line))
        
        # Draw all lines
        for line in lines:
            p.drawString(x, y, line)
            y -= line_height
            
        return y  # Return the final y position after drawing
    
    # RIGHT: Client
    p.setFont("Helvetica-Bold", 11)
    if client:
        y_pos = right_col_y
        p.drawString(right, y_pos, (client.client_name or ""))
        p.setFont("Helvetica", 10)
        y_pos -= 15  # Move down for next line
        
        # SIRET directly under client name if available
        if getattr(client, 'tsa_number', None):
            p.drawString(right, y_pos, f"SIRET: {client.tsa_number}")
            y_pos -= 15
            
        # Address with multi-line support
        if getattr(client, 'client_address', None):
            y_pos = draw_multiline_text(client.client_address, right, y_pos) - 5
            
        # Phone
        if getattr(client, 'phone', None):
            p.drawString(right, y_pos, (client.phone or ""))
            y_pos -= 15
            
        # TVA number
        if getattr(client, 'tva_number', None):
            p.drawString(right, y_pos, f"Numéro de TVA: {client.tva_number}")
    else:
        p.drawString(right, right_col_y, "Client")
    
    # Chantier (site/project)
    # chantier_y = left_col_y - 100
    # p.setFont("Helvetica-Bold", 12)
    # p.drawString(left, chantier_y, "CHANTIER Arc de seine")
    
    # Add table header below chantier
    table_y = chantier_y - 30  # Position below chantier
    table_header_y = table_y + 20
    
    # Draw header line with reduced spacing
    p.setLineWidth(0.5)  # Thinner line for header
    p.line(40, table_header_y, 550, table_header_y)
    
    # Table headers
    p.setFont("Helvetica-Bold", 10)
    
    headers = [
        {"text": "Description", "width": 250},  
        {"text": "Qté", "width": 70},       
        {"text": "Prix unitaire", "width": 100},  
        {"text": "TVA (%)", "width": 60},    
        {"text": "Total HT", "width": 70}     
    ]
    
    # Calculate total width of all headers
    total_width = sum(header["width"] for header in headers)
    
    # Calculate centered position
    page_width = 550  # Page width from 40 to 550
    header_x = (page_width - total_width) / 2 + 40  # Centered position
    
    # Draw black background for entire header area
    p.setFillColorRGB(0, 0, 0)  # Black
    p.rect(header_x, table_header_y - 20, total_width, 20, fill=1)
    
    # Draw white text
    p.setFillColorRGB(1, 1, 1)  # White
    current_x = header_x
    for header in headers:
        if header["text"] == "Total HT":
            # Right-align Total HT
            text_width = p.stringWidth(header["text"], "Helvetica-Bold", 10)
            p.drawString(current_x + header["width"] - text_width - 5, table_header_y - 15, header["text"])
        else:
            # Left-align other columns
            p.drawString(current_x + 5, table_header_y - 15, header["text"])
        current_x += header["width"]
    
    # Fetch facture items
    facture_items = db.execute(select(Facture).where(Facture.contract_id == contract.id))
    facture_items = facture_items.scalars().all()
    
    # Reset fill color to black for text
    p.setFillColorRGB(0, 0, 0)
    
    # Draw facture items in the table
    y_position = table_header_y - 15  # Reduced spacing after header
    total_amount = 0
    
    if facture_items:
        for item in facture_items:
            # Calculate row height based on description lines
            description = str(item.description) if item.description else ""
            description_lines = description.split('\n')
            additional_lines = min(len(description_lines) - 1, 3) if len(description_lines) > 1 else 0
            row_height = 18  # Reduced row height for more compact rows
            # Check if we need a new page
            if y_position < 100:  # If too close to bottom, start a new page
                p.showPage()
                p.setFont("Helvetica", 10)
                y_position = 750  # Reset y position for new page
                
                # Redraw header on new page
                p.setFillColorRGB(0, 0, 0)  # Black
                p.rect(header_x, y_position, total_width, 20, fill=1)
                p.setFillColorRGB(1, 1, 1)  # White
                current_x = header_x
                for header in headers:
                    if header["text"] == "Total HT":
                        text_width = p.stringWidth(header["text"], "Helvetica-Bold", 10)
                        p.drawString(current_x + header["width"] - text_width - 5, y_position - 15, header["text"])
                    else:
                        p.drawString(current_x + 5, y_position - 15, header["text"])
                    current_x += header["width"]
                y_position -= 20
                p.setFillColorRGB(0, 0, 0)  # Reset to black for content
            
            # Draw row data
            current_x = header_x
            p.setFont("Helvetica", 9)
            
            # Description - handle multi-line text
            description = str(item.description) if item.description else ""
            description_lines = description.split('\n')  # Split by line breaks
            
            # Draw first line in the main row
            first_line = description_lines[0][:40] if description_lines else ""
            p.drawString(current_x + 5, y_position - 15, first_line)
            
            # If there are additional lines, draw them below
            if len(description_lines) > 1:
                temp_y = y_position - 15
                for i, line in enumerate(description_lines[1:], 1):
                    if i >= 3:  # Limit to 3 additional lines to prevent overflow
                        break
                    temp_y -= 12  # Move down for each additional line
                    if temp_y > 50:  # Make sure we don't go too low on the page
                        p.drawString(current_x + 5, temp_y, line[:40])
            
            current_x += headers[0]["width"]
            
            # Quantity with unit (e.g., "432 unités", "100 m")
            qty_text = format_qty(item.qty, getattr(item, 'qty_unit', 'unite'))
            qty_width = p.stringWidth(qty_text, "Helvetica", 9)
            p.drawString(current_x + headers[1]["width"] - qty_width - 5, y_position - 15, qty_text)
            current_x += headers[1]["width"]
            
            # Unit Price
            unit_price_text = f"{item.unit_price:.2f}"
            unit_price_width = p.stringWidth(unit_price_text, "Helvetica", 9)
            p.drawString(current_x + headers[2]["width"] - unit_price_width - 5, y_position - 15, unit_price_text)
            current_x += headers[2]["width"]
            
            # TVA from facture
            tva_rate = item.tva if hasattr(item, 'tva') else 0.0
            tva_text = f"{tva_rate:.2f}%"
            tva_width = p.stringWidth(tva_text, "Helvetica", 9)
            p.drawString(current_x + headers[3]["width"] - tva_width - 5, y_position - 15, tva_text)
            current_x += headers[3]["width"]
            
            # Total HT (use pre-calculated total_ht from facture table)
            total_ht = item.total_ht
            total_ht_text = f"{total_ht:.2f}"
            total_ht_width = p.stringWidth(total_ht_text, "Helvetica", 9)
            p.drawString(current_x + headers[4]["width"] - total_ht_width - 5, y_position - 15, total_ht_text)
            
            # Add to total
            total_amount += total_ht
            
            # Draw horizontal line at the bottom of the row with reduced spacing
            line_y = y_position - (row_height - 2)  # Slightly reduce the row height
            p.setLineWidth(0.3)  # Thinner line for row separators
            p.line(header_x, line_y, header_x + total_width, line_y)
            y_position = line_y  # Use the actual line position for next row
            
            # Move to next row
            y_position -= row_height
    else:
        row_height = 20  # Define row_height for the else case
        # If no details, add a placeholder row
        p.setFont("Helvetica", 9)
        p.drawString(header_x + 5, y_position - 15, "Services as per contract")
        current_x = header_x + headers[0]["width"]
        
        # Quantity
        p.drawString(current_x + headers[1]["width"] - 15, y_position - 15, "1")
        current_x += headers[1]["width"]
        
        # Unit Price
        price_text = f"{contract.price:.2f}"
        price_width = p.stringWidth(price_text, "Helvetica", 9)
        p.drawString(current_x + headers[2]["width"] - price_width - 5, y_position - 15, price_text)
        current_x += headers[2]["width"]
        
        # TVA (use contract TVA if available, otherwise 0%)
        tva_rate = getattr(contract, 'tva', 0.0)
        tva_text = f"{tva_rate:.2f}%"
        tva_width = p.stringWidth(tva_text, "Helvetica", 9)
        p.drawString(current_x + headers[3]["width"] - tva_width - 5, y_position - 15, tva_text)
        current_x += headers[3]["width"]
        
        # Total HT
        p.drawString(current_x + headers[4]["width"] - price_width - 5, y_position - 15, price_text)
        total_amount = contract.price
        
        # Draw horizontal line at the bottom of the row with reduced spacing
        line_y = y_position - (row_height - 2)  # Slightly reduce the row height
        p.setLineWidth(0.3)  # Thinner line for row separators
        p.line(header_x, line_y, header_x + total_width, line_y)
        y_position = line_y  # Use the actual line position for next row
        
        # Move to next row
        y_position -= row_height
    
    # Draw vertical lines for all columns
    current_x = header_x
    for header in headers[:-1]:  # Draw lines for all but last column
        p.line(current_x, table_header_y, current_x, y_position)
        current_x += header["width"]
    # Draw rightmost line at the end of the last column
    p.line(current_x, table_header_y, current_x, y_position)
    
    # Draw bottom line
    p.line(header_x, y_position, header_x + total_width, y_position)
    
    # Add totals section
    y_position = ensure_space(y_position - 20, 160)
    p.setFont("Helvetica-Bold", 10)
    
    # Total HT
    p.drawString(header_x + 5, y_position - 15, "Total HT:")
    total_text = f"{total_amount:.2f} €"
    total_width_text = p.stringWidth(total_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - total_width_text - 5, y_position - 15, total_text)
    
    # Calculate total TVA from all factures
    y_position = ensure_space(y_position - 20, 140)
    tva_amount = sum(item.total_ht * (getattr(item, 'tva', 0.0) / 100) for item in factures) if 'factures' in locals() else 0.0
    p.drawString(header_x + 5, y_position - 15, "TVA:")
    tva_text = f"{tva_amount:.2f} €"
    tva_width_text = p.stringWidth(tva_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - tva_width_text - 5, y_position - 15, tva_text)
    
    # Total TTC (HT + TVA)
    y_position = ensure_space(y_position - 20, 140)
    total_ttc = total_amount + tva_amount
    p.drawString(header_x + 5, y_position - 15, "Total TTC:")
    ttc_text = f"{total_ttc:.2f} €"
    ttc_width_text = p.stringWidth(ttc_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - ttc_width_text - 5, y_position - 15, ttc_text)
    
    # Add legal text above details.png image
    y_position = ensure_space(y_position - 30, 200)
    p.setFont("Helvetica", 8)
    p.drawString(left, y_position, "TVA non applicable - Section 283 du CGI - Autoliquidation des services")
    y_position -= 12
    p.drawString(left, y_position, "Type de transaction : Services")
    y_position -= 12
    p.drawString(left, y_position, "Pas d'escompte accordé pour paiement anticipé.")
    y_position -= 12
    p.drawString(left, y_position, "En cas de non-paiement à la date d'échéance, des pénalités calculées à trois fois le taux d'intérêt légal seront appliquées.")
    y_position -= 12
    p.drawString(left, y_position, "Tout retard de paiement entraînera une indemnité forfaitaire pour frais de recouvrement de 40€.")
    
    # Add 6 lines of distance before payment details
    y_position -= (6 * 12)  # 6 lines × 12 points per line = 72 points
    
    # Add payment details text below legal text (pay.png image removed)
    y_position = ensure_space(y_position - 30, 150)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(left, y_position, "Détails du paiement")
    y_position -= 16
    p.setFont("Helvetica", 9)
    
    # Payment details in a structured format
    label_x = left
    value_x = left + 150  # align values in a column
    
    p.drawString(label_x, y_position, "Nom du bénéficiaire")
    p.drawString(value_x, y_position, "NEXT NR-GIE")
    y_position -= 14
    
    p.drawString(label_x, y_position, "BIC")
    p.drawString(value_x, y_position, "CMCIFR2A")
    y_position -= 14
    
    p.drawString(label_x, y_position, "IBAN")
    p.drawString(value_x, y_position, "FR7610278062310002236670146")
    y_position -= 14
    
    p.showPage()
    p.save()
    buffer.seek(0)
    return Response(buffer.read(), media_type="application/pdf", headers={"Content-Disposition": f"inline; filename=estimate_{contract.command_number}.pdf"})

@router.get("/facture/{contract_id}")
def generate_facture_pdf_by_contract(contract_id: int, db: Session = Depends(get_db)):
    """
    Generate a PDF for facture by contract ID - this is what the frontend expects!
    """
    logger.info(f"\n=== Generating Facture PDF for Contract ID: {contract_id} ===")
    
    # Get contract data
    contract = db.execute(select(Contract).where(Contract.id == contract_id)).scalars().first()
    if not contract:
        logger.error(f"Contract with ID {contract_id} not found")
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Get client data
    client = db.execute(select(Client).where(Client.id == contract.client_id)).scalars().first()
    if not client:
        logger.error(f"Client not found for contract ID {contract_id}")
        raise HTTPException(status_code=404, detail="Client not found")
    
    logger.info(f"Client: {client.client_name} (ID: {client.id})")
    
    # Get all factures for this contract
    factures = db.execute(
        select(Facture)
        .where(Facture.contract_id == contract_id)
        .order_by(Facture.created_at)
    ).scalars().all()
    
    if not factures:
        logger.warning(f"No factures found for contract ID {contract_id}")
        raise HTTPException(status_code=404, detail="No factures found for this contract")
    
    # Log all facture details
    logger.info(f"Found {len(factures)} factures:")
    for i, facture in enumerate(factures, 1):
        logger.info(f"\nFacture #{i}:")
        logger.info(f"  ID: {facture.id}")
        logger.info(f"  Description: {facture.description}")
        logger.info(f"  Quantity: {facture.qty}")
        logger.info(f"  Unit Price: {facture.unit_price} €")
        logger.info(f"  TVA: {facture.tva}%")
        logger.info(f"  Total HT: {facture.total_ht} €")
        logger.info(f"  Created At: {facture.created_at}")
    
    # Calculate totals
    total_ht = sum(f.total_ht for f in factures)
    total_tva = sum(f.total_ht * (f.tva / 100) for f in factures)
    total_ttc = total_ht + total_tva
    
    logger.info("\n=== TOTALS ===")
    logger.info(f"Total HT: {total_ht:.2f} €")
    logger.info(f"Total TVA: {total_tva:.2f} €")
    logger.info(f"Total TTC: {total_ttc:.2f} €")
    logger.info("================\n")
    
    # Generate the PDF
    return generate_estimate_pdf(contract_id, db)

@router.post("/facture")
def generate_facture_pdf(facture_data: dict, db: Session = Depends(get_db)):
    """
    Generate a PDF for a facture
    """
    from reportlab.lib.utils import ImageReader
    
    logger.info("\n=== Starting Facture PDF Generation ===")
    
    # Log detailed facture information
    logger.info("\n=== FACTURE DATA ===")
    logger.info(f"Facture ID: {facture_data.get('id', 'N/A')}")
    logger.info(f"Contract ID: {facture_data.get('contract_id', 'N/A')}")
    logger.info(f"Description: {facture_data.get('description', 'N/A')}")
    logger.info(f"Quantity: {facture_data.get('qty', 'N/A')}")
    logger.info(f"Unit Price: {facture_data.get('unit_price', 'N/A')} €")
    logger.info(f"TVA: {facture_data.get('tva', 'N/A')}%")
    logger.info(f"Total HT: {facture_data.get('total_ht', 'N/A')} €")
    logger.info(f"Client: {facture_data.get('client_name', 'N/A')}")
    logger.info("==================\n")
    
    # Log important facture data
    facture_id = facture_data.get('id', 'N/A')
    contract_id = facture_data.get('contract_id', 'N/A')
    logger.info(f"Processing Facture ID: {facture_id}, Contract ID: {contract_id}")
    
    if 'description' in facture_data:
        logger.info(f"Description: {facture_data['description']}")
    if 'qty' in facture_data and 'unit_price' in facture_data:
        logger.info(f"Qty: {facture_data['qty']}, Unit Price: {facture_data['unit_price']}")
    if 'client_name' in facture_data:
        logger.info(f"Client: {facture_data['client_name']}")
    
    logger.info("Starting PDF generation...")
    
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)

    # Margins and layout
    left = 40
    right = 320
    y = 740
    line_height = 22

    # Title
    p.setFont("Helvetica-Bold", 28)
    p.drawString(left, y, "Facture")
    y -= 2 * line_height

    # Invoice info (left col)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(left, y, "Numéro de facture")
    p.setFont("Helvetica", 12)
    p.drawString(left + 170, y, f"{facture_data.get('id', '')}")
    y -= line_height
    
    # Dates
    p.setFont("Helvetica-Bold", 12)
    p.drawString(left, y, "Date d'émission")
    p.setFont("Helvetica", 12)
    p.drawString(left + 170, y, f"{datetime.now().strftime('%d/%m/%Y')}")
    y -= line_height

    # Logo (top right)
    logo_y = 700
    logo_x = 440
    logo_width = 150
    logo_height = 55
    logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app", "static", "logonr.jpg")
    if os.path.exists(logo_path):
        p.drawImage(ImageReader(logo_path), logo_x, logo_y, width=logo_width, height=logo_height, mask='auto')

    # Addresses and info
    y -= 2 * line_height
    left_col_y = y
    
    # LEFT: Supplier
    p.setFont("Helvetica-Bold", 11)
    p.drawString(left, left_col_y, "NEXT NR–GIE")
    p.setFont("Helvetica", 10)
    p.drawString(left, left_col_y - 15, "2 Rue Des Frênes")
    p.drawString(left, left_col_y - 30, "91100 Corbeil-Essonnes, FR")
    p.drawString(left, left_col_y - 45, "nextrngie@gmail.com")
    p.drawString(left, left_col_y - 60, "93060154700019")
    p.drawString(left, left_col_y - 75, "Numéro de TVA: FR26930601547")

    # RIGHT: Client
    p.setFont("Helvetica-Bold", 11)
    p.drawString(right, left_col_y, f"Client: {facture_data.get('client_name', 'Non spécifié')}")
    p.setFont("Helvetica", 10)
    
    client_address = facture_data.get('client_address')
    if client_address:
        p.drawString(right, left_col_y - 15, client_address)
    
    client_email = facture_data.get('client_email')
    client_phone = facture_data.get('client_phone')
    client_tva = facture_data.get('client_tva')
    
    y_offset = left_col_y - 15
    if client_email and client_email != 'N/A':
        y_offset -= 15
        p.drawString(right, y_offset, f"Email: {client_email}")
    
    if client_phone and client_phone != 'N/A':
        y_offset -= 15
        p.drawString(right, y_offset, f"Tél: {client_phone}")
    
    if client_tva and client_tva != 'N/A':
        y_offset -= 15
        p.drawString(right, y_offset, f"N° TVA: {client_tva}")

    # Line items header
    y = left_col_y - 120
    p.setFont("Helvetica-Bold", 10)
    p.drawString(left, y, "Désignation")
    p.drawString(350, y, "Qté")
    p.drawString(400, y, "Prix U. HT")
    p.drawString(500, y, "Total HT")
    y -= 15
    # Draw horizontal line under header with right border
    p.line(left, y, 550, y)  # Top line
    p.line(550, y, 550, y + 15)  # Right border line
    y -= 15

    # Line items
    p.setFont("Helvetica", 10)
    total_ht = float(facture_data.get('total_ht', 0))
    
    # Add facture items with line break preservation for description
    description = facture_data.get('description', '')
    
    # Split description by line breaks first, then handle word wrapping for each line
    description_lines = description.split('\n')
    lines = []
    max_width = 250  # Maximum width for description before wrapping
    
    # Process each line separately to preserve line breaks
    for desc_line in description_lines:
        if not desc_line.strip():  # Empty line
            lines.append('')
            continue
            
        # Word wrap this line if it's too long
        words = desc_line.split()
        current_line = []
        current_width = 0
        
        for word in words:
            word_width = p.stringWidth(word + ' ', 'Helvetica', 10)
            if current_width + word_width <= max_width:
                current_line.append(word)
                current_width += word_width
            else:
                if current_line:  # Only append if there's content
                    lines.append(' '.join(current_line))
                current_line = [word]
                current_width = word_width
        
        if current_line:
            lines.append(' '.join(current_line))
    
    # Draw the first line with all data
    first_line_y = y
    p.drawString(left, first_line_y, lines[0] if lines else '')
    p.drawString(370, first_line_y, str(facture_data.get('qty', 0)))
    p.drawString(420, first_line_y, f"{float(facture_data.get('unit_price', 0)):.2f} €")
    p.drawString(500, first_line_y, f"{total_ht:.2f} €")
    # Draw right border for the row
    p.line(550, first_line_y + 5, 550, first_line_y - 15)  # Right border line
    
    # Draw remaining description lines indented with right border
    for i in range(1, len(lines)):
        first_line_y -= 15
        p.drawString(left + 10, first_line_y, lines[i])
        # Draw right border for each line of description
        p.line(550, first_line_y + 5, 550, first_line_y - 10)
    
    y = first_line_y - 25  # Extra space after description

    # Totals with right border
    p.line(400, y, 550, y)  # Top line
    p.line(550, y, 550, y + 20)  # Right border line
    y -= 20
    p.setFont("Helvetica-Bold", 10)
    p.drawString(400, y, "Total HT:")
    p.drawString(500, y, f"{total_ht:.2f} €")
    # Draw right border for the total line
    p.line(550, y + 5, 550, y - 15)
    y -= 20
    
    # Calculate TVA from facture data
    tva_rate = float(facture_data.get('tva', 0.0))  # Get TVA rate from facture data
    tva_amount = total_ht * (tva_rate / 100)  # Calculate TVA amount
    total_ttc = total_ht + tva_amount
    
    p.drawString(400, y, f"TVA ({tva_rate:.1f}%):")
    p.drawString(500, y, f"{tva_amount:.2f} €")
    y -= 20
    
    p.line(400, y, 550, y)
    y -= 20
    p.setFont("Helvetica-Bold", 12)
    p.drawString(400, y, "Total TTC:")
    p.drawString(500, y, f"{total_ttc:.2f} €")
    
    # Legal notes under Total TTC (small font) — let content flow naturally
    y = ensure_space(y - 30, 200)
    p.setStrokeColorRGB(0.2, 0.2, 0.2)
    p.line(40, y, 550, y)
    y -= 18
    p.setFont("Helvetica", 8)
    p.drawString(left, y, "TVA non applicable - Section 283 du CGI - Autoliquidation des services")
    y -= 12
    p.drawString(left, y, "Type de transaction : Services")
    y -= 12
    p.drawString(left, y, "Pas d’escompte accordé pour paiement anticipé.")
    y -= 12
    p.drawString(left, y, "En cas de non-paiement à la date d’échéance, des pénalités calculées à trois fois le taux d’intérêt légal seront appliquées.")
    y -= 12
    p.drawString(left, y, "Tout retard de paiement entraînera une indemnité forfaitaire pour frais de recouvrement de 40€.")

    # Payment details section
    y = ensure_space(y - 18, 160)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(left, y, "Détails du paiement")
    y -= 16
    p.setFont("Helvetica", 9)
    label_x = left
    value_x = right  # align values in a right column
    p.drawString(label_x, y, "Nom du bénéficiaire")
    p.drawString(value_x, y, "NEXT NR-GIE")
    y -= 14
    p.drawString(label_x, y, "BIC")
    p.drawString(value_x, y, "CMCIFR2A")
    y -= 14
    p.drawString(label_x, y, "IBAN")
    p.drawString(value_x, y, "FR7610278062310002236670146")
    y -= 14
    # p.drawString(label_x, y, "Référence")
    # p.drawString(value_x, y, "QECVZDX")

    p.save()
    buffer.seek(0)
    
    # Log PDF generation completion
    file_size = len(buffer.getvalue()) / 1024  # Size in KB
    logger.info(f"PDF generation completed. File size: {file_size:.2f} KB")
    logger.info("=== End of Facture PDF Generation ===\n")
    
    return Response(content=buffer.getvalue(), media_type="application/pdf", headers={
        "Cache-Control": "no-store, max-age=0",
        "Pragma": "no-cache"
    })

@router.post("/devis")
async def generate_devis_pdf(payload: dict):
    """
    Generate a Devis PDF from a payload (client + items).
    Expected payload format:
    {
      "name": "Devis ClientName 01/01/2025",
      "client": {"name": str, "email": str, "phone": str, "tva": str},
      "items": [
        {"description": str, "qty": number, "unit_price": number, "tva": number, "total_ht": number}, ...
      ]
    }
    """
    from reportlab.lib.utils import ImageReader

    buffer = BytesIO()
    footer_left_text = "NEXT NR-GIE, SAS avec un capital de 5 000,00 € • 930 601 547 Evry B"
    p = NumberedCanvas(buffer, pagesize=letter, footer_left=footer_left_text, doc_number="")

    # Page-break helper
    def ensure_space(current_y: int, min_y: int = 140) -> int:
        if current_y < min_y:
            p.showPage()
            return 760
        return current_y

    # Layout
    left = 40
    right = 320
    y = 740
    line_height = 22

    # Always use a fixed title for Devis, without client name/date from payload
    title = "Devis"
    client = payload.get("client", {})
    items = payload.get("items", []) or []

    # Title
    p.setFont("Helvetica-Bold", 24)
    p.drawString(left, y, title)
    y -= int(1.5 * line_height)

    # Devis number - extract from name (format: "Devis 079 - Client Name")
    p.setFont("Helvetica-Bold", 12)
    p.drawString(left, y, "Numéro de devis")
    p.setFont("Helvetica", 12)
    
    # Try to extract the number from the name (e.g., "079" from "Devis 079 - test 22/10/2025")
    devis_number = ""
    name = payload.get('name', '')
    if 'Devis' in name and '-' in name:
        # Extract the part between "Devis" and "-"
        number_part = name.split('Devis')[1].split('-')[0].strip()
        if number_part:
            devis_number = number_part
    
    # If no number found in name, fall back to devis_number from payload,
    # else use the whole name as a last resort to show something
    if not devis_number:
        # Ensure we never pass None to ReportLab
        devis_number = payload.get('devis_number') or payload.get('name') or ""
    # Extra safety: coerce to string
    devis_number = str(devis_number)
    
    p.drawString(left + 170, y, devis_number)
    try:
        p._doc_number = str(devis_number)
    except Exception:
        pass
    y -= line_height

    # Issue date - use creation_date from payload if available, otherwise use current date
    p.setFont("Helvetica-Bold", 12)
    p.drawString(left, y, "Date d'émission")
    p.setFont("Helvetica", 12)
    
    # Get creation date from payload or use current date
    creation_date = datetime.now()
    if 'creation_date' in payload and payload['creation_date']:
        try:
            # Try to parse the date from the payload
            creation_date = datetime.strptime(payload['creation_date'], '%Y-%m-%d')
        except (ValueError, TypeError):
            # If parsing fails, use current date
            pass
    
    p.drawString(left + 170, y, creation_date.strftime('%d/%m/%Y'))
    y -= line_height
    # Expiration date (from payload.expiration)
    exp_iso = payload.get("expiration")
    exp_text = ""
    if exp_iso:
      try:
        # Support ISO with trailing 'Z' (UTC)
        iso2 = exp_iso.replace('Z', '+00:00')
        exp_dt = datetime.fromisoformat(iso2)
        exp_text = exp_dt.strftime('%d/%m/%Y')
      except Exception:
        try:
          # Fallback: parse as YYYY-MM-DD
          date_part = exp_iso.split('T')[0]
          y_, m_, d_ = date_part.split('-')
          exp_text = f"{d_}/{m_}/{y_}"
        except Exception:
          exp_text = ""
    p.setFont("Helvetica-Bold", 12)
    p.drawString(left, y, "Date d'expiration")
    p.setFont("Helvetica", 12)
    p.drawString(left + 170, y, exp_text)
    y -= line_height

    # Logo (top right)
    logo_y = 700
    logo_x = 440
    logo_width = 150
    logo_height = 55
    logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app", "static", "logonr.jpg")
    if os.path.exists(logo_path):
        p.drawImage(ImageReader(logo_path), logo_x, logo_y, width=logo_width, height=logo_height, mask='auto')

    # Supplier
    y -= 2 * line_height
    left_col_y = y
    right_col_y = y
    p.setFont("Helvetica-Bold", 11)
    p.drawString(left, left_col_y, "NEXT NR–GIE")
    p.setFont("Helvetica", 10)
    p.drawString(left, left_col_y - 15, "2 Rue Des Frênes")
    p.drawString(left, left_col_y - 30, "91100 Corbeil-Essonnes, FR")
    p.drawString(left, left_col_y - 45, "nextrngie@gmail.com")
    p.drawString(left, left_col_y - 60, "93060154700019")
    p.drawString(left, left_col_y - 75, "Numéro de TVA: FR26930601547")

    # Client
    p.setFont("Helvetica-Bold", 11)
    client_name = (client.get("name") or client.get("client_name") or "").strip()
    
    # Word-wrap client name
    y_offset = right_col_y
    if client_name:
        max_width = 200
        words = client_name.split()
        line = ""
        lines = []
        for w in words:
            test = (line + (" " if line else "") + w)
            if p.stringWidth(test, "Helvetica-Bold", 11) <= max_width:
                line = test
            else:
                if line:
                    lines.append(line)
                line = w
        if line:
            lines.append(line)
        for ln in lines:
            p.drawString(right, y_offset, ln)
            y_offset -= 15
    else:
        p.drawString(right, y_offset, "Client")
        y_offset -= 15
    
    p.setFont("Helvetica", 10)
    
    # SIRET
    siret = client.get("tsa_number") or client.get("siret")
    if siret:
        p.drawString(right, y_offset, f"SIRET: {siret}")
        y_offset -= 15
        
    # Address (multi-line)
    addr = client.get("client_address") or client.get("address")
    if addr:
        for line in str(addr).replace('\r\n','\n').replace('\r','\n').split('\n'):
            if line.strip():
                p.drawString(right, y_offset, line.strip())
                y_offset -= 15
    
    # TVA number
    tva_num = client.get("tva") or client.get("tva_number")
    if tva_num:
        p.drawString(right, y_offset, f"Numéro de TVA: {tva_num}")
        y_offset -= 15

    # Chantier (site/project) - Add "CHANTIER BEIGE MONCEAU" above the table
    # Position for chantier (commented out but keeping the y-position calculation)
    chantier_y = left_col_y - 100
    # p.setFont("Helvetica-Bold", 12)
    # p.drawString(left, chantier_y, "CHANTIER BEIGE MONCEAU")
    
    # Table header
    table_y = chantier_y - 30
    table_header_y = table_y + 20

    headers = [
        {"text": "Description", "width": 250},
        {"text": "Quantité", "width": 100},  # Increased width to accommodate unit
        {"text": "Prix unitaire", "width": 100},
        {"text": "TVA (%)", "width": 60},
        {"text": "Total HT", "width": 70},
    ]
    total_width = sum(h["width"] for h in headers)
    page_width = 550
    header_x = (page_width - total_width) / 2 + 40

    p.setFillColorRGB(0, 0, 0)
    p.rect(header_x, table_header_y - 20, total_width, 20, fill=1)
    p.setFillColorRGB(1, 1, 1)
    current_x = header_x
    p.setFont("Helvetica-Bold", 10)
    for h in headers:
        if h["text"] == "Total HT":
            text_width = p.stringWidth(h["text"], "Helvetica-Bold", 10)
            p.drawString(current_x + h["width"] - text_width - 5, table_header_y - 15, h["text"])
        else:
            p.drawString(current_x + 5, table_header_y - 15, h["text"])
        current_x += h["width"]

    # Items rows
    p.setFillColorRGB(0, 0, 0)
    y_pos = table_header_y - 20
    total_amount = 0.0

    for item in items:
        # Calculate row height based on description lines
        description = str(item.get("description", ""))
        description_lines = description.split('\n')
        additional_lines = min(len(description_lines) - 1, 3) if len(description_lines) > 1 else 0
        row_height = 20 + (additional_lines * 12)  # Base height + extra for additional lines
        if y_pos < 100:
            p.showPage()
            p.setFont("Helvetica", 10)
            y_pos = 750
            # Redraw header on new page
            p.setLineWidth(0.7)
            p.setFillColorRGB(0, 0, 0)
            p.rect(header_x, y_pos, total_width, 20, fill=1)
            p.setFillColorRGB(1, 1, 1)
            current_x = header_x
            for h in headers:
                if h["text"] == "Total HT":
                    text_width = p.stringWidth(h["text"], "Helvetica-Bold", 10)
                    p.drawString(current_x + h["width"] - text_width - 5, y_pos - 15, h["text"])
                else:
                    p.drawString(current_x + 5, y_pos - 15, h["text"])
                current_x += h["width"]
            y_pos -= 20
            p.setFillColorRGB(0, 0, 0)

        current_x = header_x
        p.setFont("Helvetica", 9)
        
        # Description with word wrapping
        desc = str(item.get("description", ""))
        max_width = headers[0]["width"] - 10  # 5px padding on each side
        words = desc.split()
        lines = []
        current_line = []
        
        # Split description into lines that fit within max_width
        for word in words:
            test_line = ' '.join(current_line + [word])
            if p.stringWidth(test_line, "Helvetica", 9) <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
        if current_line:
            lines.append(' '.join(current_line))
            
        # Draw each line of the description
        line_height = 12
        desc_y = y_pos - 10  # Start a bit higher to center the text
        for i, line in enumerate(lines):
            if i > 0:  # If we need to add more lines
                y_pos -= line_height
                # Check if we need a new page
                if y_pos < 100:
                    close_table_borders(page_top, y_position + line_height)
                    p.showPage()
                    p.setFont("Helvetica", 10)
                    y_position = 750
                    # Redraw header on new page
                    p.setLineWidth(0.7)
                    p.setFillColorRGB(0, 0, 0)
                    p.rect(header_x, y_position, total_width, 20, fill=1)
                    p.setFillColorRGB(1, 1, 1)
                    current_x_header = header_x
                    for header in headers:
                        if header["text"] == "Total HT":
                            text_width = p.stringWidth(header["text"], "Helvetica-Bold", 10)
                            p.drawString(current_x_header + header["width"] - text_width - 5, y_position - 15, header["text"])
                        else:
                            p.drawString(current_x_header + 5, y_position - 15, header["text"])
                        current_x_header += header["width"]
                    y_position -= 20
                    page_top = y_position + 20
                    p.setFillColorRGB(0, 0, 0)
                    desc_y = y_position - 10
            
            p.drawString(header_x + 5, desc_y, line)
            desc_y -= line_height
            
        # Adjust y_position based on number of lines
        y_position -= (len(lines) - 1) * line_height
        
        current_x += headers[0]["width"]
        # Qty with unit
        qty = float(item.get("qty", 0))
        qty_unit = item.get("qty_unit", "unite")
        qty_text = format_qty(qty, qty_unit)
        qty_width = p.stringWidth(qty_text, "Helvetica", 9)
        p.drawString(current_x + headers[1]["width"] - qty_width - 5, y_pos - 15, qty_text)
        current_x += headers[1]["width"]
        # Unit price
        unit_price = float(item.get("unit_price", 0))
        unit_price_text = f"€ {unit_price:.2f}"
        unit_price_width = p.stringWidth(unit_price_text, "Helvetica", 9)
        p.drawString(current_x + headers[2]["width"] - unit_price_width - 5, y_pos - 15, unit_price_text)
        current_x += headers[2]["width"]
        # TVA
        tva_val = float(item.get("tva", 0))
        tva_text = f"{tva_val:.2f}%"
        tva_width = p.stringWidth(tva_text, "Helvetica", 9)
        p.drawString(current_x + headers[3]["width"] - tva_width - 5, y_pos - 15, tva_text)
        current_x += headers[3]["width"]
        # Total HT
        total_ht = float(item.get("total_ht", (unit_price * float(item.get("qty", 0)))))
        total_ht_text = f"€ {total_ht:.2f}"
        total_ht_width = p.stringWidth(total_ht_text, "Helvetica", 9)
        p.drawString(current_x + headers[4]["width"] - total_ht_width - 5, y_pos - 15, total_ht_text)

        total_amount += total_ht
        # Draw horizontal line at the bottom of the row with reduced spacing
        line_y = y_pos - (row_height - 2)  # Slightly reduce the row height
        p.setLineWidth(0.3)  # Thinner line for row separators
        p.line(header_x, line_y, header_x + total_width, line_y)
        y_pos = line_y  # Use the actual line position for next row
        
        # Move to next row
        y_pos -= row_height
        p.setLineWidth(0.3)  # Thinner line for row separators
        p.line(header_x, line_y, header_x + total_width, line_y)
        y_pos = line_y  # Use the actual line position for next row
        
        # Move to next row
        y_pos -= row_height

    # Column lines - only draw if we have items
    if 'items' in payload and len(payload['items']) > 0:
        p.setLineWidth(0.7)
        current_x = header_x
        for h in headers[:-1]:
            p.line(current_x, table_header_y, current_x, y_pos)
            current_x += h["width"]
        p.line(current_x, table_header_y, current_x, y_pos)
        p.line(header_x, y_pos, header_x + total_width, y_pos)

    # Totals
    y_pos = ensure_space(y_pos - 20, 160)
    p.setFont("Helvetica-Bold", 10)
    p.drawString(header_x + 5, y_pos - 15, "Total HT:")
    total_text = f"{total_amount:.2f} €"
    total_width_text = p.stringWidth(total_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - total_width_text - 5, y_pos - 15, total_text)

    y_pos = ensure_space(y_pos - 20, 140)
    tva_amount = 0.0
    p.drawString(header_x + 5, y_pos - 15, "TVA:")
    tva_text = f"{tva_amount:.2f} €"
    tva_width_text = p.stringWidth(tva_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - tva_width_text - 5, y_pos - 15, tva_text)

    y_pos = ensure_space(y_pos - 20, 140)
    total_ttc = total_amount
    p.drawString(header_x + 5, y_pos - 15, "Total TTC:")
    ttc_text = f"{total_ttc:.2f} €"
    ttc_width_text = p.stringWidth(ttc_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - ttc_width_text - 5, y_pos - 15, ttc_text)

    p.save()
    buffer.seek(0)
    filename = f"devis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    return Response(buffer.read(), media_type="application/pdf", headers={"Content-Disposition": f"inline; filename={filename}"})