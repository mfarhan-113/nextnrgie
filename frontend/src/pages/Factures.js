import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getApiUrl, getPdfUrl } from '../config/api';
// Material UI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Pagination from '@mui/material/Pagination';

import { styled, alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';

import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';

// Layout
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { CssBaseline } from '@mui/material';

import '../modern-contracts.css';
import '../toast.css';

// Styled Components
const StatsCard = styled(Card)({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
  },
});

const ModernCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(156, 39, 176, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    borderColor: alpha('#9c27b0', 0.2),
  },
}));

const ActionButton = styled(Button)(({ variant = 'view' }) => ({
  minWidth: '44px',
  height: '44px',
  borderRadius: '12px',
  padding: '8px',
  transition: 'all 0.2s ease-in-out',
  ...(variant === 'view' && {
    backgroundColor: alpha('#9c27b0', 0.1),
    color: '#9c27b0',
    '&:hover': {
      backgroundColor: '#9c27b0',
      color: 'white',
      transform: 'scale(1.05)',
    }
  }),
  ...(variant === 'create' && {
    backgroundColor: alpha('#4caf50', 0.1),
    color: '#4caf50',
    '&:hover': {
      backgroundColor: '#4caf50',
      color: 'white',
      transform: 'scale(1.05)',
    }
  })
}));

const AddButton = styled(IconButton)({
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: '#9c27b0',
  color: 'white',
  zIndex: 9999,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: '#7b1fa2',
    transform: 'scale(1.1)',
    boxShadow: '0 8px 25px rgba(156, 39, 176, 0.4)',
  },
  boxShadow: '0 6px 20px rgba(156, 39, 176, 0.3)',
  '&:active': {
    transform: 'scale(0.95)',
  }
});


const Factures = () => {
  const { t } = useTranslation();

  // Layout state
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Contracts (like clients in Devis)
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');

  // Invoices list (like createdDevis)
  const [createdInvoices, setCreatedInvoices] = useState([]); // { id, name, contractId, date, dueDate }
  const [itemsByInvoice, setItemsByInvoice] = useState({}); // { [invoiceId]: [{description, qty, unit_price, tva, total_ht}] }
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');

  // Modal form state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsForm, setDetailsForm] = useState({
    description: '',
    qty: '',
    qty_unit: 'unite', // Add qty_unit with default value 'unite'
    unit_price: '',
    tva: '',
    total_ht: ''
  });

  // UX state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contractsById, setContractsById] = useState({});
  const [hydrationDone, setHydrationDone] = useState(false);
  const [dueDateDrafts, setDueDateDrafts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({}); // Track which invoices have items expanded
  const [editingItem, setEditingItem] = useState(null); // Track which item is being edited
  const [editItemForm, setEditItemForm] = useState({
    description: '',
    qty: '',
    qty_unit: 'unite',
    unit_price: '',
    tva: '',
    total_ht: ''
  });
  
  // Toast notification state
  const [toast, setToast] = useState('');
  
  // Initialize edit form state with the correct unit dropdown value
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter invoices based on search term
  const filteredInvoices = useMemo(() => {
    if (!searchTerm.trim()) return createdInvoices;
    const term = searchTerm.toLowerCase();
    return createdInvoices.filter(invoice => {
      const contract = contracts.find(c => String(c.id) === String(invoice.contractId));
      const contractName = contract?.command_number?.toLowerCase() || '';
      return (
        invoice.name.toLowerCase().includes(term) ||
        contractName.includes(term) ||
        invoice.id.toLowerCase().includes(term)
      );
    });
  }, [createdInvoices, searchTerm, contracts]);
  
  // Paginated invoices
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredInvoices.slice(startIndex, endIndex);
  }, [filteredInvoices, currentPage, itemsPerPage]);
  
  // Total pages
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const createBackendInvoice = async (invoiceData) => {
  try {
    const response = await axios.post(getApiUrl('invoices/'), {
      invoice_number: invoiceData.name,
      contract_id: parseInt(invoiceData.contractId, 10), // Ensure it's an integer
      amount: 0, // Required by schema
      due_date: invoiceData.dueDate || new Date().toISOString().split('T')[0], // Ensure valid date
      status: 'unpaid' // Default status
    });
    return response.data;
  } catch (error) {
    console.error('Error creating invoice in backend:', error.response?.data || error.message);
    throw error; // Re-throw to be caught by the caller
  }
};

  // Helper: resolve backend invoice id for a local invoice
  const resolveBackendInvoiceId = async (invoice) => {
    if (invoice.backendId) return invoice.backendId;
    try {
      const allInvRes = await axios.get(getApiUrl('invoices/'));
      const match = (Array.isArray(allInvRes.data) ? allInvRes.data : []).find(
        (row) => String(row.contract_id) === String(invoice.contractId) && String(row.invoice_number) === String(invoice.name)
      );
      return match?.id;
    } catch {
      return undefined;
    }
  };

  // Create a new invoice for a contract
  const createInvoiceForContract = async (contractId) => {
    const contract = contractsById[contractId];
    if (!contract) return;

    // Generate a unique ID for the new invoice (client-side)
    const newInvoiceId = `inv-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    // Build a unique, human-friendly invoice number
    const year = new Date().getFullYear();
    const baseNumber = `INV-${contract.command_number || contractId}-${year}`;

    // Determine next sequence for this contract/year
    const existingForBase = createdInvoices.filter(inv =>
      String(inv.contractId) === String(contractId) &&
      typeof inv.name === 'string' &&
      inv.name.startsWith(baseNumber)
    );
    let seq = existingForBase.length + 1;

    // Ensure uniqueness across all invoices by incrementing if needed
    let candidateName = `${baseNumber}-${String(seq).padStart(2, '0')}`;
    const existingNames = new Set(createdInvoices.map(inv => inv.name));
    while (existingNames.has(candidateName)) {
      seq += 1;
      candidateName = `${baseNumber}-${String(seq).padStart(2, '0')}`;
    }

    const newInvoice = {
      id: newInvoiceId,
      contractId: contractId,
      name: candidateName,
      date: today,
      dueDate: today // Will be updated when items are added
    };
    try {
      const backendInvoice = await createBackendInvoice(newInvoice);
      const backendId = backendInvoice && backendInvoice.id;
      const persisted = { ...newInvoice, backendId };
      setCreatedInvoices(prev => [...prev, persisted]);
      setItemsByInvoice(prev => ({
        ...prev,
        [newInvoiceId]: []
      }));
      setSelectedInvoiceId(newInvoiceId);
      setToast(t('invoice_created') || 'Invoice created successfully!');
    } catch (e) {
      setToast(t('invoice_create_error') || 'Error creating invoice. Please try again.');
    }
    setTimeout(() => setToast(''), 2500);
  };

  // Delete an invoice
  const deleteInvoice = (invoiceId) => {
    if (window.confirm(t('confirm_delete_invoice') || 'Are you sure you want to delete this invoice?')) {
      setCreatedInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      
      // Also delete its items
      setItemsByInvoice(prev => {
        const newItems = { ...prev };
        delete newItems[invoiceId];
        return newItems;
      });
      
      if (selectedInvoiceId === invoiceId) {
        setSelectedInvoiceId('');
      }
      
      setToast(t('invoice_deleted') || 'Invoice deleted successfully!');
      setTimeout(() => setToast(''), 2500);
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Persistence helpers (localStorage with cookie fallback)
  const persist = useMemo(() => ({
    get: (key) => {
      let tempPriceSet = false;
    let originalPrice = undefined;
    try {
        const v = localStorage.getItem(key);
        if (v) return v;
      } catch {}
      try {
        const escapedKey = key.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&');
        const match = document.cookie.match(new RegExp('(?:^|; )' + escapedKey + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
      } catch {}
      return null;
    },
    set: (key, value) => {
      try { localStorage.setItem(key, value); } catch {}
      try {
        const expires = new Date(Date.now() + 365*24*60*60*1000).toUTCString();
        document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
      } catch {}
    },
    remove: (key) => {
      try { localStorage.removeItem(key); } catch {}
      try {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      } catch {}
    }
  }), []);

  // Fetch contracts on component mount
  useEffect(() => {
    fetchContracts();
  }, []);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedInvoices = persist.get('createdInvoices');
      const savedItems = persist.get('itemsByInvoice');
      if (savedInvoices) {
        setCreatedInvoices(JSON.parse(savedInvoices));
      }
      if (savedItems) {
        setItemsByInvoice(JSON.parse(savedItems));
      }
    } catch (e) {
      console.error('Hydration error:', e);
    } finally {
      setHydrationDone(true);
    }
  }, [persist]);

  // Persist invoices whenever they change
  useEffect(() => {
    if (!hydrationDone) return;
    try {
      persist.set('createdInvoices', JSON.stringify(createdInvoices));
    } catch {}
  }, [createdInvoices, hydrationDone, persist]);

  // Persist items whenever they change
  useEffect(() => {
    if (!hydrationDone) return;
    try {
      persist.set('itemsByInvoice', JSON.stringify(itemsByInvoice));
    } catch {}
  }, [itemsByInvoice, hydrationDone, persist]);

  // Fetch contracts on mount
  const fetchContracts = async () => {
    try {
      const res = await axios.get(getApiUrl('contracts/'));
      const contractsList = res.data || [];
      setContracts(contractsList);
      
      // Build contractsById map
      const byId = {};
      contractsList.forEach(c => {
        byId[c.id] = c;
      });
      setContractsById(byId);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setError(t('failed_to_load_contracts') || 'Failed to load contracts');
    }
  };

  // Update invoice due date
  const updateInvoiceDueDate = (invoiceId, dueDate) => {
    setCreatedInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, dueDate } : inv
    ));
  };

  // Open modal to add item
  const openAddItemModal = (invoiceId) => {
    if (!invoiceId) {
      setError(t('select_invoice_first') || 'Please select an invoice first.');
      return;
    }
    setSelectedInvoiceId(invoiceId);
    setDetailsForm({ 
      description: '', 
      qty: '', 
      qty_unit: 'unite',
      unit_price: '', 
      tva: '', 
      total_ht: '' 
    });
    setDetailsModalOpen(true);
  };

  const closeModal = () => setDetailsModalOpen(false);

  // Toggle items visibility for a specific invoice
  const toggleItemsVisibility = (invoiceId) => {
    setExpandedItems(prev => ({
      ...prev,
      [invoiceId]: !prev[invoiceId]
    }));
  };

  // Delete an item from an invoice
  const deleteItem = async (invoiceId, itemIndex) => {
    if (window.confirm(t('confirm_delete_item') || 'Are you sure you want to delete this item?')) {
      // If this item exists in backend, delete it there first
      try {
        const current = itemsByInvoice[invoiceId] || [];
        const item = current[itemIndex];
        if (item && item.backendFactureId) {
          await axios.delete(getApiUrl(`factures/${item.backendFactureId}`));
        }
      } catch (e) {
        console.warn('Failed to delete facture from backend (continuing locally):', e?.message || e);
      }

      setItemsByInvoice(prev => {
        const newItems = { ...prev };
        newItems[invoiceId] = newItems[invoiceId].filter((_, idx) => idx !== itemIndex);
        try { persist.set('itemsByInvoice', JSON.stringify(newItems)); } catch {}
        return newItems;
      });
      setToast(t('item_deleted_successfully') || 'Item deleted successfully!');
      setTimeout(() => setToast(''), 2500);
    }
  };

  // Start editing an item
  const startEditItem = (invoiceId, itemIndex, item) => {
    console.log('Editing item:', item);
    setEditingItem({ invoiceId, itemIndex });
    setEditItemForm({
      description: item.description || '',
      qty: item.qty || '',
      qty_unit: item.qty_unit || 'unite',
      unit_price: item.unit_price || '',
      tva: item.tva || '',
      total_ht: item.total_ht || ''
    });
  };

  // Handle edit form changes with TVA calculation
  const handleEditItemChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...editItemForm, [name]: value };
    
    // Recalculate when any of these fields change
    if (['qty', 'unit_price', 'tva'].includes(name)) {
      const qty = parseFloat(updatedForm.qty) || 0;
      const unitPrice = parseFloat(updatedForm.unit_price) || 0;
      const tvaRate = (parseFloat(updatedForm.tva) || 0) / 100;
      
      const subtotal = qty * unitPrice;
      const tvaAmount = subtotal * tvaRate;
      updatedForm.total_ht = (subtotal + tvaAmount).toFixed(2);
    }
    
    setEditItemForm(updatedForm);
  };

  // Save edited item
  const saveEditedItem = () => {
    if (!editingItem) return;
    
    setItemsByInvoice(prev => {
      const newItems = { ...prev };
      newItems[editingItem.invoiceId][editingItem.itemIndex] = {
        description: editItemForm.description,
        qty: parseFloat(editItemForm.qty) || 0,
        qty_unit: editItemForm.qty_unit || 'unite',
        unit_price: parseFloat(editItemForm.unit_price) || 0,
        tva: parseFloat(editItemForm.tva) || 0,
        total_ht: parseFloat(editItemForm.total_ht) || 0
      };
      try { persist.set('itemsByInvoice', JSON.stringify(newItems)); } catch {}
      return newItems;
    });
    
    setEditingItem(null);
    setEditItemForm({ description: '', qty: '', unit_price: '', tva: '', total_ht: '' });
    setToast(t('item_updated_successfully') || 'Item updated successfully!');
    setTimeout(() => setToast(''), 2500);
  };

  // Cancel editing
  const cancelEditItem = () => {
    setEditingItem(null);
    setEditItemForm({ description: '', qty: '', qty_unit: 'unite', unit_price: '', tva: '', total_ht: '' });
  };

  // Handle form input changes with TVA calculation
  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    
    // Update the form state
    setDetailsForm(prev => {
      // Create updated form with new value
      const updatedForm = { ...prev, [name]: value };
      
      // Recalculate when any of these fields change
      if (['qty', 'unit_price', 'tva'].includes(name)) {
        const qty = parseFloat(updatedForm.qty) || 0;
        const unitPrice = parseFloat(updatedForm.unit_price) || 0;
        const tvaRate = (parseFloat(updatedForm.tva) || 0) / 100;
        
        const subtotal = qty * unitPrice;
        const tvaAmount = subtotal * tvaRate;
        updatedForm.total_ht = (subtotal + tvaAmount).toFixed(2);
      }
      
      return updatedForm;
    });
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      setError(t('select_invoice_first') || 'Please select an invoice first.');
      return;
    }

    try {
      const newItem = {
        description: detailsForm.description,
        qty: detailsForm.qty,
        qty_unit: detailsForm.qty_unit || 'unite',
        unit_price: detailsForm.unit_price,
        tva: detailsForm.tva,
        total_ht: detailsForm.total_ht
      };

      // VALIDATION: Check if adding this item will exceed contract amount
      const invoice = createdInvoices.find(inv => inv.id === selectedInvoiceId);
      if (invoice) {
        const contract = contractsById[invoice.contractId];
        const contractPrice = parseFloat(contract?.price) || 0;
        
        // Calculate current total of all invoices for this contract
        const invoicesForContract = createdInvoices.filter(inv => String(inv.contractId) === String(invoice.contractId));
        const totalInvoiced = invoicesForContract.reduce((sum, inv) => {
          const invTotal = parseFloat(calculateInvoiceTotal(inv.id)) || 0;
          return sum + invTotal;
        }, 0);
        
        // Add the new item amount
        const newItemTotal = parseFloat(newItem.total_ht) || 0;
        const newTotal = totalInvoiced + newItemTotal;
        
        if (newTotal > contractPrice) {
          const remaining = (contractPrice - totalInvoiced).toFixed(2);
          setToast(`Cannot add item! Contract limit exceeded. Remaining: €${remaining}, Tried to add: €${newItemTotal.toFixed(2)}`);
          setTimeout(() => setToast(''), 4000);
          return;
        }
      }

      // Persist the item to backend 'factures' with invoice linkage
      try {
        const invoice = createdInvoices.find(inv => inv.id === selectedInvoiceId);
        const backendInvoiceId = invoice ? await resolveBackendInvoiceId(invoice) : undefined;
        const res = await axios.post(getApiUrl('/factures/'), {
          contract_id: invoice ? parseInt(invoice.contractId) : undefined,
          invoice_id: backendInvoiceId ? parseInt(backendInvoiceId) : undefined,
          description: newItem.description,
          qty: Number(newItem.qty) || 0,
          qty_unit: newItem.qty_unit || 'unite',
          unit_price: Number(newItem.unit_price) || 0,
          tva: Number(newItem.tva) || 0,
          total_ht: Number(newItem.total_ht) || 0
        });
        const backendFactureId = res?.data?.id;

        setItemsByInvoice(prev => {
          const list = prev[selectedInvoiceId] ? [...prev[selectedInvoiceId]] : [];
          list.push({ ...newItem, backendFactureId });
          const next = { ...prev, [selectedInvoiceId]: list };
          try { persist.set('itemsByInvoice', JSON.stringify(next)); } catch {}
          return next;
        });
      } catch (err) {
        console.error('Failed to persist facture to backend', err);
        // Still store locally to not block the UI
        setItemsByInvoice(prev => {
          const list = prev[selectedInvoiceId] ? [...prev[selectedInvoiceId]] : [];
          list.push(newItem);
          const next = { ...prev, [selectedInvoiceId]: list };
          try { persist.set('itemsByInvoice', JSON.stringify(next)); } catch {}
          return next;
        });
      }

      setToast(t('item_added') || 'Item added successfully!');
      setTimeout(() => setToast(''), 2500);

      // Reset and close
      setDetailsForm({ description: '', qty: '', unit_price: '', tva: '', total_ht: '' });
      setDetailsModalOpen(false);
    } catch (err) {
      console.error('Error saving invoice item', err);
      setError(t('error_saving_data') || 'Error saving data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total for an invoice
  const calculateInvoiceTotal = (invoiceId) => {
    const items = itemsByInvoice[invoiceId] || [];
    return items.reduce((sum, item) => sum + (parseFloat(item.total_ht) || 0), 0).toFixed(2);
  };

  // Calculate remaining amount for a contract
  const calculateRemainingAmount = (contractId) => {
    const contract = contractsById[contractId];
    if (!contract) return 0;
    
    const contractPrice = parseFloat(contract.price) || 0;
    
    // Calculate total of all invoices for this contract
    const invoicesForContract = createdInvoices.filter(inv => String(inv.contractId) === String(contractId));
    const totalInvoiced = invoicesForContract.reduce((sum, inv) => {
      const invTotal = parseFloat(calculateInvoiceTotal(inv.id)) || 0;
      return sum + invTotal;
    }, 0);
    
    return (contractPrice - totalInvoiced).toFixed(2);
  };

  // Generate PDF for an invoice using backend API
  const generateInvoicePDF = async (invoice) => {
    const contract = contractsById[invoice.contractId];
    const items = itemsByInvoice[invoice.id] || [];
    let tempPriceSet = false;
    let originalPrice;
    
    if (!contract) {
      setToast(t('contract_not_found') || 'Contract not found');
      setTimeout(() => setToast(''), 2500);
      return;
    }

    if (items.length === 0) {
      setToast(t('no_items_to_generate_pdf') || 'Please add items before generating PDF');
      setTimeout(() => setToast(''), 2500);
      return;
    }

    try {
      // For PDF generation, we need to temporarily save items to factures table
      // Backend PDF reads from factures table, not contract_details
      
      const currentItems = itemsByInvoice[invoice.id] || [];
      const currentTotal = currentItems.reduce((sum, item) => sum + (parseFloat(item.total_ht) || 0), 0);
      
      // STEP 1: First, ensure contract has enough capacity by setting price to a large value
      // This prevents validation errors when adding items
      const TEMP_LARGE_PRICE = 999999; // Temporary large value
      originalPrice = contract.price;
      await axios.put(getApiUrl(`contracts/${invoice.contractId}`), {
        ...contract,
        price: TEMP_LARGE_PRICE
      });
      tempPriceSet = true;
      
      // STEP 2: Delete ALL existing factures for this contract
      try {
        const existingFactures = await axios.get(getApiUrl(`/factures/contract/${invoice.contractId}`), {
          validateStatus: function (status) {
            return status === 200 || status === 404; // Resolve only if the status code is 200 or 404
          }
        });
        
        // If we have factures, delete them
        if (existingFactures.data && existingFactures.data.length > 0) {
          for (const facture of existingFactures.data) {
            await axios.delete(getApiUrl(`factures/${facture.id}`));
          }
        } else {
          console.log('No existing factures to delete');
        }
      } catch (e) {
        console.log('Error checking for existing factures:', e.message);
      }

      // STEP 3: Add ONLY current invoice items to factures table
      // Ensure we have a backend invoice id to link factures so amounts sum correctly
      let backendInvoiceId = invoice.backendId;
      if (!backendInvoiceId) {
        try {
          const allInvRes = await axios.get(getApiUrl('invoices/'));
          const match = (Array.isArray(allInvRes.data) ? allInvRes.data : []).find(
            (row) => String(row.contract_id) === String(invoice.contractId) && String(row.invoice_number) === String(invoice.name)
          );
          if (match && match.id) {
            backendInvoiceId = match.id;
          }
        } catch {}
      }
      for (const item of currentItems) {
        await axios.post(getApiUrl('/factures/'), {
          contract_id: parseInt(invoice.contractId),
          invoice_id: backendInvoiceId ? parseInt(backendInvoiceId) : undefined,
          description: item.description,
          qty: Number(item.qty) || 0,
          qty_unit: item.qty_unit || 'unite',  // Default to 'unite' if not specified
          unit_price: Number(item.unit_price) || 0,
          tva: Number(item.tva) || 0,
          total_ht: Number(item.total_ht) || ((Number(item.qty) || 0) * (Number(item.unit_price) || 0))
        });
      }

      // STEP 4: Generate PDF using the contract ID directly
      // Use backend endpoint /pdf/estimate/{contract_id}
      const res = await axios.get(
        getApiUrl(`pdf/estimate/${invoice.contractId}`),
        { 
          responseType: 'blob',
          headers: { 'Accept': 'application/pdf' }
        }
      );
      
      if (!res.data) {
        throw new Error('No PDF data received from server');
      }

      // Success path continues

      // Open PDF in new tab
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);

      // Show success message
      setToast(t('pdf_generated_successfully') || 'PDF generated successfully!');
      setTimeout(() => setToast(''), 2500);

    } catch (err) {
      console.error('Failed to generate PDF', err);
      setToast(t('error_generating_pdf') || 'Failed to generate PDF');
      setTimeout(() => setToast(''), 2500);
    } finally {
      // Always attempt to restore original contract price if we changed it
      try {
        if (tempPriceSet) {
          await axios.put(getApiUrl(`contracts/${invoice.contractId}`), {
            ...contract,
            price: originalPrice
          });
          // Refresh contracts to get updated data
          fetchContracts();
        }
      } catch (e) {
        console.error('Failed to restore original contract price', e);
      }
    }
  };

  // Main component return
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(10px)',
      }
    }}>
      <CssBaseline />
      <Navbar handleDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />

      <Box component="main" sx={{ 
        flexGrow: 1, 
        px: { xs: 2, md: 4 }, 
        mt: { xs: 7.5, md: 8 }, 
        pb: 4, 
        minHeight: '100vh', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(20px)',
        borderRadius: { md: '24px 0 0 0' },
        boxShadow: { md: '0 0 40px rgba(0,0,0,0.1)', xs: 0 },
        position: 'relative',
        zIndex: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" fontWeight={800} sx={{ 
            background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mr: 2
          }}>
            {t('invoices') || 'Invoices'}
          </Typography>
          <Box sx={{ 
            width: 4, 
            height: 40, 
            background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
            borderRadius: 2 
          }} />
          <Chip 
            label={`${createdInvoices.length} ${t('invoices') || 'Invoices'}`}
            sx={{ 
              ml: 2, 
              fontWeight: 700, 
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
              color: 'white'
            }} 
          />
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder={t('search_invoices') || 'Search invoices...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9c27b0' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: 'white',
                '&:hover fieldset': {
                  borderColor: '#9c27b0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#9c27b0',
                },
              },
            }}
          />
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {contracts.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {t('total_contracts') || 'Total Contracts'}
                    </Typography>
                  </Box>
                  <DescriptionIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {createdInvoices.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {t('total_invoices') || 'Total Invoices'}
                    </Typography>
                  </Box>
                  <ReceiptIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Contract Selector - Create Invoice */}
        <ModernCard sx={{ mb: 6, p: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#333' }}>
            {t('create_new_invoice') || 'Create New Invoice'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl sx={{ flex: 1, minWidth: 250 }}>
              <InputLabel id="contract-select-label">
                {t('select_contract') || 'Select Contract'}
              </InputLabel>
              <Select
                labelId="contract-select-label"
                id="contract-select"
                value={selectedContractId}
                label={t('select_contract') || 'Select Contract'}
                onChange={(e) => setSelectedContractId(e.target.value)}
                sx={{
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha('#9c27b0', 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9c27b0',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9c27b0',
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <em>{t('choose_contract') || 'Choose a contract...'}</em>
                </MenuItem>
                {contracts.map((contract) => (
                  <MenuItem key={contract.id} value={contract.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight={600}>
                        {contract.command_number || `Contract ${contract.id}`}
                      </Typography>
                      <Chip 
                        label={`€${parseFloat(contract.price || 0).toFixed(2)}`}
                        size="small"
                        sx={{ 
                          ml: 2,
                          backgroundColor: alpha('#4caf50', 0.15),
                          color: '#4caf50',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => {
                if (selectedContractId) {
                  createInvoiceForContract(selectedContractId);
                  setSelectedContractId('');
                } else {
                  setToast(t('please_select_contract') || 'Please select a contract first');
                  setTimeout(() => setToast(''), 2500);
                }
              }}
              disabled={!selectedContractId}
              sx={{
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7b1fa2 0%, #512da8 100%)',
                  boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  background: '#ccc',
                  color: '#888',
                  boxShadow: 'none',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {t('create_invoice') || 'Create Invoice'}
            </Button>
          </Box>
        </ModernCard>

        {/* Invoices Section - Bottom */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#333' }}>
            {t('created_invoices') || 'Created Invoices'}
          </Typography>
          {filteredInvoices.length > 0 && (
            <Chip 
              label={`${filteredInvoices.length} ${t('total') || 'Total'}`}
              sx={{ 
                fontWeight: 600,
                backgroundColor: alpha('#9c27b0', 0.1),
                color: '#9c27b0'
              }}
            />
          )}
        </Box>
        <Grid container spacing={3}>
          {filteredInvoices.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <ReceiptIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  {t('no_invoices_created') || 'No invoices created yet'}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {t('create_invoice_hint') || 'Select a contract and click "Create Invoice" to get started'}
                </Typography>
              </Box>
            </Grid>
          ) : (
            paginatedInvoices.map((invoice, idx) => {
              const contract = contractsById[invoice.contractId];
              const items = itemsByInvoice[invoice.id] || [];
              const total = calculateInvoiceTotal(invoice.id);
              const isExpanded = expandedItems[invoice.id];

              return (
                <Grid item xs={12} key={invoice.id}>
                  <Fade in={true} timeout={300 + idx * 50}>
                    <ModernCard>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#333', mb: 1 }}>
                              {invoice.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              {t('contract') || 'Contract'}: {contract?.command_number || 'N/A'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                              <Chip 
                                icon={<CalendarTodayIcon />}
                                label={invoice.date}
                                size="small"
                                sx={{ backgroundColor: alpha('#2196f3', 0.1), color: '#2196f3' }}
                              />
                              <Chip 
                                label={`${items.length} ${t('items') || 'items'}`}
                                size="small"
                                sx={{ backgroundColor: alpha('#ff9800', 0.1), color: '#ff9800' }}
                              />
                              <Chip 
                                label={`Total: €${total}`}
                                size="small"
                                sx={{ backgroundColor: alpha('#4caf50', 0.1), color: '#4caf50', fontWeight: 600 }}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title={t('view_pdf') || 'View PDF'}>
                              <ActionButton variant="view" onClick={() => generateInvoicePDF(invoice)}>
                                <VisibilityIcon />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title={t('add_item') || 'Add Item'}>
                              <ActionButton variant="create" onClick={() => openAddItemModal(invoice.id)}>
                                <AddIcon />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title={t('delete_invoice') || 'Delete Invoice'}>
                              <ActionButton onClick={() => deleteInvoice(invoice.id)}>
                                <DeleteIcon />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title={isExpanded ? t('hide_items') : t('show_items')}>
                              <ActionButton onClick={() => toggleItemsVisibility(invoice.id)}>
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </ActionButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        {/* Items List */}
                        {isExpanded && (
                          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                            {items.length === 0 ? (
                              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                                {t('no_items_added') || 'No items added yet'}
                              </Typography>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {items.map((item, itemIdx) => {
                                  const isEditing = editingItem?.invoiceId === invoice.id && editingItem?.itemIndex === itemIdx;
                                  
                                  return (
                                    <Box 
                                      key={itemIdx} 
                                      sx={{ 
                                        p: 2, 
                                        backgroundColor: alpha('#9c27b0', 0.05),
                                        borderRadius: '12px',
                                        border: '1px solid',
                                        borderColor: alpha('#9c27b0', 0.1),
                                        '& .MuiSelect-select': {
                                          paddingTop: '8px',
                                          paddingBottom: '8px',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }
                                      }}
                                    >
                                      {isEditing ? (
                                        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                                          <Grid item xs={12} sm={6}>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              label={t('description') || 'Description'}
                                              name="description"
                                              value={editItemForm.description}
                                              onChange={handleEditItemChange}
                                            />
                                          </Grid>
                                          <Grid item xs={4} sm={2}>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              type="number"
                                              label={t('quantity') || 'Qty'}
                                              name="qty"
                                              value={editItemForm.qty}
                                              onChange={handleEditItemChange}
                                              inputProps={{ min: 0, step: 0.01 }}
                                            />
                                          </Grid>
                                          <Grid item xs={4} sm={2}>
                                            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                                              <InputLabel id="edit-qty-unit-label">Unit</InputLabel>
                                              <Select
                                                labelId="edit-qty-unit-label"
                                                name="qty_unit"
                                                value={editItemForm.qty_unit || 'unite'}
                                                onChange={handleEditItemChange}
                                                label="Unit"
                                                sx={{ height: '40px' }}
                                              >
                                                <MenuItem value="unite">Unité</MenuItem>
                                                <MenuItem value="ensemble">Ensemble</MenuItem>
                                                <MenuItem value="meter">m</MenuItem>
                                              </Select>
                                            </FormControl>
                                          </Grid>
                                          <Grid item xs={4} sm={2}>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              type="number"
                                              label={t('unit_price') || 'Unit Price'}
                                              name="unit_price"
                                              value={editItemForm.unit_price}
                                              onChange={handleEditItemChange}
                                            />
                                          </Grid>
                                          <Grid item xs={6} sm={3}>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              type="number"
                                              label={t('tva') || 'TVA %'}
                                              name="tva"
                                              value={editItemForm.tva}
                                              onChange={handleEditItemChange}
                                            />
                                          </Grid>
                                          <Grid item xs={6} sm={3}>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              type="number"
                                              label={t('total') || 'Total'}
                                              name="total_ht"
                                              value={editItemForm.total_ht}
                                              InputProps={{ readOnly: true }}
                                            />
                                          </Grid>
                                          <Grid item xs={12} sm={6}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                              <Button variant="contained" size="small" onClick={saveEditedItem}>
                                                {t('save') || 'Save'}
                                              </Button>
                                              <Button variant="outlined" size="small" onClick={cancelEditItem}>
                                                {t('cancel') || 'Cancel'}
                                              </Button>
                                            </Box>
                                          </Grid>
                                        </Grid>
                                      ) : (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <Box>
                                            <Typography variant="body1" fontWeight={600}>
                                              {item.description}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                              {t('qty')}: {item.qty} × €{item.unit_price} | TVA: {item.tva}% | {t('total')}: €{item.total_ht}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title={t('edit') || 'Edit'}>
                                              <IconButton size="small" onClick={() => startEditItem(invoice.id, itemIdx, item)}>
                                                <EditIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('delete') || 'Delete'}>
                                              <IconButton size="small" onClick={() => deleteItem(invoice.id, itemIdx)}>
                                                <DeleteIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          </Box>
                                        </Box>
                                      )}
                                    </Box>
                                  );
                                })}
                              </Box>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </ModernCard>
                  </Fade>
                </Grid>
              );
            })
          )}
        </Grid>
        
        {/* Pagination */}
        {filteredInvoices.length > itemsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
            <Pagination 
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minWidth: '44px',
                  height: '44px',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7b1fa2 0%, #512da8 100%)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: alpha('#9c27b0', 0.1),
                  },
                },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Add Item Modal */}
      {detailsModalOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
          }}
          onClick={closeModal}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: 4,
              maxWidth: 600,
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={700}>
                {t('add_item') || 'Add Item'}
              </Typography>
              <IconButton onClick={closeModal}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Remaining Amount Display */}
            {selectedInvoiceId && (() => {
              const invoice = createdInvoices.find(inv => inv.id === selectedInvoiceId);
              if (invoice) {
                const remaining = calculateRemainingAmount(invoice.contractId);
                const contract = contractsById[invoice.contractId];
                return (
                  <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    backgroundColor: parseFloat(remaining) > 0 ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
                    borderRadius: '12px',
                    border: `2px solid ${parseFloat(remaining) > 0 ? '#4caf50' : '#f44336'}`
                  }}>
                    <Typography variant="body1" fontWeight={600} sx={{ color: parseFloat(remaining) > 0 ? '#4caf50' : '#f44336' }}>
                      Contract Total: €{parseFloat(contract?.price || 0).toFixed(2)}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ color: parseFloat(remaining) > 0 ? '#4caf50' : '#f44336', mt: 1 }}>
                      Remaining Amount: €{remaining}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', mt: 0.5, display: 'block' }}>
                      {parseFloat(remaining) > 0 
                        ? 'You can add items up to this amount' 
                        : 'Contract limit reached! Cannot add more items.'}
                    </Typography>
                  </Box>
                );
              }
              return null;
            })()}

            <form onSubmit={handleDetailsSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('description') || 'Description'}
                    name="description"
                    value={detailsForm.description}
                    onChange={handleDetailsChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={1}>
                    <Grid item xs={7}>
                      <TextField
                        fullWidth
                        type="number"
                        label={t('quantity') || 'Quantity'}
                        name="qty"
                        value={detailsForm.qty}
                        onChange={handleDetailsChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <FormControl fullWidth>
                        <InputLabel>Unit</InputLabel>
                        <Select
                          name="qty_unit"
                          value={detailsForm.qty_unit || 'unite'}
                          onChange={handleDetailsChange}
                          label="Unit"
                          MenuProps={{
                            disablePortal: true,
                            PaperProps: {
                              onClick: (e) => e.stopPropagation(),
                            },
                          }}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha('#9c27b0', 0.3),
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#9c27b0',
                            },
                            height: '40px',
                            '& .MuiSelect-select': {
                              paddingTop: '8px',
                              paddingBottom: '8px',
                            }
                          }}
                        >
                          <MenuItem value="unite">Unité</MenuItem>
                          <MenuItem value="ensemble">Ensemble</MenuItem>
                          <MenuItem value="meter">m</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('unit_price') || 'Unit Price'}
                    name="unit_price"
                    value={detailsForm.unit_price}
                    onChange={handleDetailsChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('tva') || 'TVA %'}
                    name="tva"
                    value={detailsForm.tva}
                    onChange={handleDetailsChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('total') || 'Total'}
                    name="total_ht"
                    value={detailsForm.total_ht}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={closeModal}>
                      {t('cancel') || 'Cancel'}
                    </Button>
                    <Button variant="contained" type="submit" disabled={loading}>
                      {loading ? <CircularProgress size={24} /> : (t('add') || 'Add')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Box>
      )}

      {/* Toast Notification */}
      {toast && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10001,
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <Typography variant="body1">{toast}</Typography>
        </Box>
      )}

      {/* Error Notification */}
      {error && (
        <Box
          sx={{
            position: 'fixed',
            top: 24,
            right: 24,
            backgroundColor: '#f44336',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10001,
            maxWidth: 400,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1">{error}</Typography>
            <IconButton size="small" onClick={() => setError('')} sx={{ color: 'white', ml: 2 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Factures;
