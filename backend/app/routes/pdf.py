from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.invoice import Invoice
from app.models.contract import Contract
from app.models.client import Client
from app.models.contract_detail import ContractDetail
from sqlalchemy.future import select
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import datetime
import os

router = APIRouter(prefix="/pdf", tags=["pdf"])

@router.get("/invoice/{invoice_id}")
async def generate_invoice_pdf(invoice_id: int, db: AsyncSession = Depends(get_db)):
    from reportlab.lib.utils import ImageReader
    import os

    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    contract_result = await db.execute(select(Contract).where(Contract.id == invoice.contract_id))
    contract = contract_result.scalars().first()

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)

    # Margins and layout
    left = 40
    right = 320
    y = 740
    line_height = 22

    # Title
    p.setFont("Helvetica-Bold", 28)
    p.drawString(left, y, "Devis")
    y -= 2 * line_height

    # Invoice info (left col)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(left, y, "Numéro de devis")
    p.setFont("Helvetica", 12)
    p.drawString(left + 170, y, f"{datetime.now().strftime('%Y%m%d')}")
    y -= line_height
    
    # Get contract dates
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
    


    # Logo (top right)
    logo_y = 700
    logo_x = 440
    logo_width = 150
    logo_height = 55
    # Use a relative path to the logo in the frontend public directory
    logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "..", "frontend", "public", "logonr.jpg")
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

    # RIGHT: Client
    p.setFont("Helvetica-Bold", 11)
    client_result = await db.execute(select(Client).where(Client.id == contract.client_id))
    client = client_result.scalars().first()
    
    if client:
        p.drawString(right, right_col_y, client.client_name)
        p.setFont("Helvetica", 10)
        p.drawString(right, right_col_y - 15, client.email)
        p.drawString(right, right_col_y - 30, client.phone)
        if client.tva_number:
            p.drawString(right, right_col_y - 45, client.tva_number)
            p.drawString(right, right_col_y - 60, f"Numéro de TVA: {client.tva_number}")
    else:
        p.drawString(right, right_col_y, "Client")
        p.setFont("Helvetica", 10)
        p.drawString(right, right_col_y - 15, "")
        p.drawString(right, right_col_y - 30, "")
        p.drawString(right, right_col_y - 45, "")

    # Chantier (site/project)
    chantier_y = left_col_y - 100
    chantier = getattr(contract, 'name', '') if contract else ''
    p.setFont("Helvetica", 11)
    p.drawString(left, chantier_y, f"Chantier BEIGE MONCEAU {chantier if chantier else ''}")

    # Add table header below chantier
    table_y = chantier_y - 30  # Position below chantier
    table_header_y = table_y + 20
    
    # Draw header line
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
    
    # Draw column lines
    current_x = header_x
    p.setStrokeColorRGB(0, 0, 0)  # Black for lines
    
    # Fetch contract details
    contract_details_result = await db.execute(select(ContractDetail).where(ContractDetail.contract_id == contract.id))
    contract_details = contract_details_result.scalars().all()
    
    # Reset fill color to black for text
    p.setFillColorRGB(0, 0, 0)
    
    # Draw contract details in the table
    row_height = 20
    y_position = table_header_y - 20
    total_amount = 0
    
    if contract_details:
        for detail in contract_details:
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
            
            # Description
            p.drawString(current_x + 5, y_position - 15, str(detail.description)[:40])
            current_x += headers[0]["width"]
            
            # Quantity
            qty_text = str(detail.qty)
            qty_width = p.stringWidth(qty_text, "Helvetica", 9)
            p.drawString(current_x + headers[1]["width"] - qty_width - 5, y_position - 15, qty_text)
            current_x += headers[1]["width"]
            
            # Unit Price
            unit_price_text = f"{detail.unit_price:.2f}"
            unit_price_width = p.stringWidth(unit_price_text, "Helvetica", 9)
            p.drawString(current_x + headers[2]["width"] - unit_price_width - 5, y_position - 15, unit_price_text)
            current_x += headers[2]["width"]
            
            # TVA
            tva_text = f"{detail.tva:.2f}%"
            tva_width = p.stringWidth(tva_text, "Helvetica", 9)
            p.drawString(current_x + headers[3]["width"] - tva_width - 5, y_position - 15, tva_text)
            current_x += headers[3]["width"]
            
            # Total HT
            total_ht_text = f"{detail.total_ht:.2f}"
            total_ht_width = p.stringWidth(total_ht_text, "Helvetica", 9)
            p.drawString(current_x + headers[4]["width"] - total_ht_width - 5, y_position - 15, total_ht_text)
            
            # Add to total
            total_amount += detail.total_ht
            
            # Draw horizontal line for this row
            p.line(header_x, y_position - 20, header_x + total_width, y_position - 20)
            
            # Move to next row
            y_position -= row_height
    else:
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
        
        # TVA (default 20%)
        p.drawString(current_x + headers[3]["width"] - 25, y_position - 15, "20.00%")
        current_x += headers[3]["width"]
        
        # Total HT
        p.drawString(current_x + headers[4]["width"] - price_width - 5, y_position - 15, price_text)
        total_amount = contract.price
        
        # Draw horizontal line for this row
        p.line(header_x, y_position - 20, header_x + total_width, y_position - 20)
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
    y_position -= 20
    p.setFont("Helvetica-Bold", 10)
    
    # Total HT
    p.drawString(header_x + 5, y_position - 15, "Total HT:")
    total_text = f"{total_amount:.2f} €"
    total_width_text = p.stringWidth(total_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - total_width_text - 5, y_position - 15, total_text)
    
    # TVA
    y_position -= 20
    tva_amount = total_amount * 0.20  # Assuming 20% TVA
    p.drawString(header_x + 5, y_position - 15, "TVA (20%):")
    tva_text = f"{tva_amount:.2f} €"
    tva_width_text = p.stringWidth(tva_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - tva_width_text - 5, y_position - 15, tva_text)
    
    # Total TTC
    y_position -= 20
    total_ttc = total_amount + tva_amount
    p.drawString(header_x + 5, y_position - 15, "Total TTC:")
    ttc_text = f"{total_ttc:.2f} €"
    ttc_width_text = p.stringWidth(ttc_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - ttc_width_text - 5, y_position - 15, ttc_text)

    p.showPage()
    p.save()
    buffer.seek(0)
    return Response(buffer.read(), media_type="application/pdf", headers={"Content-Disposition": f"inline; filename=invoice_{datetime.now().strftime('%Y%m%d')}.pdf"})


@router.get("/estimate/{contract_id}")
async def generate_estimate_pdf(contract_id: int, db: AsyncSession = Depends(get_db)):
    from reportlab.lib.utils import ImageReader
    import os
    
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalars().first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    client_result = await db.execute(select(Client).where(Client.id == contract.client_id))
    client = client_result.scalars().first()
    
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Margins and layout
    left = 40
    right = 350
    y = 750
    line_height = 20
    
    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawString(left, y, "DEVIS")
    p.setFont("Helvetica", 12)
    p.drawString(left + 80, y, f"N° {contract.command_number}")
    y -= line_height * 1.5
    
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
    
    # Logo (top right)
    logo_y = 700
    logo_x = 440
    logo_width = 150
    logo_height = 55
    # Use a relative path to the logo in the frontend public directory
    logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "..", "frontend", "public", "logonr.jpg")
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
    
    # RIGHT: Client
    p.setFont("Helvetica-Bold", 11)
    if client:
        p.drawString(right, right_col_y, client.client_name)
        p.setFont("Helvetica", 10)
        p.drawString(right, right_col_y - 15, client.email)
        p.drawString(right, right_col_y - 30, client.phone)
        if client.tva_number:
            p.drawString(right, right_col_y - 45, client.tva_number)
            p.drawString(right, right_col_y - 60, f"Numéro de TVA: {client.tva_number}")
    else:
        p.drawString(right, right_col_y, "Client")
        p.setFont("Helvetica", 10)
        p.drawString(right, right_col_y - 15, "")
        p.drawString(right, right_col_y - 30, "")
        p.drawString(right, right_col_y - 45, "")
    
    # Chantier (site/project)
    chantier_y = left_col_y - 100
    chantier = getattr(contract, 'name', '') if contract else ''
    p.setFont("Helvetica", 11)
    p.drawString(left, chantier_y, f"Chantier {chantier if chantier else ''}")
    
    # Add table header below chantier
    table_y = chantier_y - 30  # Position below chantier
    table_header_y = table_y + 20
    
    # Draw header line
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
    
    # Fetch contract details
    contract_details_result = await db.execute(select(ContractDetail).where(ContractDetail.contract_id == contract.id))
    contract_details = contract_details_result.scalars().all()
    
    # Reset fill color to black for text
    p.setFillColorRGB(0, 0, 0)
    
    # Draw contract details in the table
    row_height = 20
    y_position = table_header_y - 20
    total_amount = 0
    
    if contract_details:
        for detail in contract_details:
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
            
            # Description
            p.drawString(current_x + 5, y_position - 15, str(detail.description)[:40])
            current_x += headers[0]["width"]
            
            # Quantity
            qty_text = str(detail.qty)
            qty_width = p.stringWidth(qty_text, "Helvetica", 9)
            p.drawString(current_x + headers[1]["width"] - qty_width - 5, y_position - 15, qty_text)
            current_x += headers[1]["width"]
            
            # Unit Price
            unit_price_text = f"{detail.unit_price:.2f}"
            unit_price_width = p.stringWidth(unit_price_text, "Helvetica", 9)
            p.drawString(current_x + headers[2]["width"] - unit_price_width - 5, y_position - 15, unit_price_text)
            current_x += headers[2]["width"]
            
            # TVA
            tva_text = f"{detail.tva:.2f}%"
            tva_width = p.stringWidth(tva_text, "Helvetica", 9)
            p.drawString(current_x + headers[3]["width"] - tva_width - 5, y_position - 15, tva_text)
            current_x += headers[3]["width"]
            
            # Total HT
            total_ht_text = f"{detail.total_ht:.2f}"
            total_ht_width = p.stringWidth(total_ht_text, "Helvetica", 9)
            p.drawString(current_x + headers[4]["width"] - total_ht_width - 5, y_position - 15, total_ht_text)
            
            # Add to total
            total_amount += detail.total_ht
            
            # Draw horizontal line for this row
            p.line(header_x, y_position - 20, header_x + total_width, y_position - 20)
            
            # Move to next row
            y_position -= row_height
    else:
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
        
        # TVA (default 20%)
        p.drawString(current_x + headers[3]["width"] - 25, y_position - 15, "20.00%")
        current_x += headers[3]["width"]
        
        # Total HT
        p.drawString(current_x + headers[4]["width"] - price_width - 5, y_position - 15, price_text)
        total_amount = contract.price
        
        # Draw horizontal line for this row
        p.line(header_x, y_position - 20, header_x + total_width, y_position - 20)
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
    y_position -= 20
    p.setFont("Helvetica-Bold", 10)
    
    # Total HT
    p.drawString(header_x + 5, y_position - 15, "Total HT:")
    total_text = f"{total_amount:.2f} €"
    total_width_text = p.stringWidth(total_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - total_width_text - 5, y_position - 15, total_text)
    
    # TVA
    y_position -= 20
    tva_amount = total_amount * 0.20  # Assuming 20% TVA
    p.drawString(header_x + 5, y_position - 15, "TVA (20%):")
    tva_text = f"{tva_amount:.2f} €"
    tva_width_text = p.stringWidth(tva_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - tva_width_text - 5, y_position - 15, tva_text)
    
    # Total TTC
    y_position -= 20
    total_ttc = total_amount + tva_amount
    p.drawString(header_x + 5, y_position - 15, "Total TTC:")
    ttc_text = f"{total_ttc:.2f} €"
    ttc_width_text = p.stringWidth(ttc_text, "Helvetica-Bold", 10)
    p.drawString(header_x + total_width - ttc_width_text - 5, y_position - 15, ttc_text)
    p.showPage()
    p.save()
    buffer.seek(0)
    return Response(buffer.read(), media_type="application/pdf", headers={"Content-Disposition": f"inline; filename=estimate_{contract.command_number}.pdf"})
