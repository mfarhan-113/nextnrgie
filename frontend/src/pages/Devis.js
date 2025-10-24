import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { getApiUrl, getPdfUrl } from '../config/api';

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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import { styled, alpha } from '@mui/material/styles';
import { TextField as MuiTextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Layout
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { CssBaseline } from '@mui/material';

import '../modern-contracts.css';
import '../toast.css';

// Using standard TextField for description

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
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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


const Devis = () => {
  const { t } = useTranslation();

  // Layout state
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Dropdowns
  const [clients, setClients] = useState([]); // {value,label}
  const [contracts, setContracts] = useState([]); // raw contracts
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedContractId, setSelectedContractId] = useState('');

  // Devis list for selected contract
  const [details, setDetails] = useState([]);

  // Modal form state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsForm, setDetailsForm] = useState({
    description: '',
    qty: '',
    qty_unit: 'unite',
    unit_price: '',
    tva: '',
    total_ht: ''
  });
  const [editingDetail, setEditingDetail] = useState(null);

  // UX state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  // In-memory created devis rows (UI only for now)
  const [createdDevis, setCreatedDevis] = useState([]); // { id, backendId, name, clientId, date, expiration }
  // Items per created devis (UI only)
  const [itemsByDevis, setItemsByDevis] = useState({}); // { [devisId]: [{description, qty, unit_price, tva, total_ht}] }
  const [selectedDevisId, setSelectedDevisId] = useState('');
  const [clientsById, setClientsById] = useState({});
  const [hydrationDone, setHydrationDone] = useState(false);
  const [expirationDrafts, setExpirationDrafts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({}); // Track which devis have items expanded
  const [editingItem, setEditingItem] = useState(null); // Track which item is being edited
  const [editItemForm, setEditItemForm] = useState({
    description: '',
    qty: '',
    qty_unit: 'unite',
    unit_price: '',
    tva: '',
    total_ht: ''
  });
  
  // State for custom devis number
  const [customDevisNumber, setCustomDevisNumber] = useState('');

  // State for devis creation modal
  const [isCreateDevisModalOpen, setIsCreateDevisModalOpen] = useState(false);
  const [newDevisNumber, setNewDevisNumber] = useState('');
  const [newDevisDate, setNewDevisDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter devis based on search term
  const filteredDevis = useMemo(() => {
    if (!searchTerm.trim()) return createdDevis;
    const term = searchTerm.toLowerCase();
    return createdDevis.filter(devis => {
      const client = clients.find(c => String(c.value) === String(devis.clientId));
      const clientName = client?.label?.toLowerCase() || '';
      return (
        devis.name.toLowerCase().includes(term) ||
        clientName.includes(term) ||
        devis.id.toLowerCase().includes(term)
      );
    });
  }, [createdDevis, searchTerm, clients]);

  // Robust persistence helpers (localStorage with cookie fallback)
  const persist = useMemo(() => ({
    get: (key) => {
      try {
        const v = localStorage.getItem(key);
        if (v) return v;
      } catch {}
      // cookie fallback
      try {
        const match = document.cookie.match(new RegExp('(?:^|; )' + key.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
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
    }
  }), []);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Load clients and contracts
  useEffect(() => {
    const load = async () => {
      try {
        const [clientsRes, contractsRes] = await Promise.all([
          api.get('clients/', { headers: authHeaders }),
          api.get('contracts/', { headers: authHeaders })
        ]);

        const formattedClients = (clientsRes.data || []).map(c => ({
          value: c.id,
          label: c.client_name || `Client #${c.client_number}`
        }));
        setClients(formattedClients);
        const map = {};
        (clientsRes.data || []).forEach(c => { map[c.id] = c; });
        setClientsById(map);
        setContracts(contractsRes.data || []);
      } catch (e) {
        console.error('Failed to load clients/contracts', e);
        setError(t('error_loading_data'));
      }
    };
    load();
  }, [authHeaders, t]);

  // Fetch estimates list from the backend (items loaded lazily on expand)
  const fetchEstimates = async () => {
    try {
      setLoading(true);
      
      // Fetch all estimates using the configured axios instance (trailing slash to avoid redirects)
      const estimatesRes = await api.get('estimates/', { headers: authHeaders });
      
      // Map estimates to the expected format; items will be fetched on demand
      const estimatesMapped = estimatesRes.data.map((estimate) => ({
        id: `devis-${estimate.id}`,
        backendId: estimate.id,
        name: estimate.estimate_number || `Devis-${estimate.id}`,
        clientId: estimate.client_id ? String(estimate.client_id) : '',
        date: estimate.creation_date || new Date().toISOString().split('T')[0],
        expiration: estimate.expiration_date || '',
        status: estimate.status || 'draft',
        amount: parseFloat(estimate.amount) || 0,
        createdAt: estimate.created_at
      }));

      // Update estimates in state
      setCreatedDevis(estimatesMapped);

      // Background prefetch: load items for each estimate so counts/lists appear across devices
      // Do not block UI; errors are swallowed and logged by fetchItemsForDevis
      ;(async () => {
        try {
          const loads = await Promise.all(
            (estimatesMapped || []).map(async (e) => {
              const items = await fetchItemsForDevis(e);
              return [e.id, items];
            })
          );
          setItemsByDevis((prev) => {
            const next = { ...prev };
            loads.forEach(([id, items]) => {
              next[id] = items;
            });
            return next;
          });
        } catch (_) {
          // no-op; per-estimate errors are already logged
        }
      })();

    } catch (error) {
      console.error('Error fetching estimates:', error);
      setError(t('error_loading_estimates') || 'Failed to load estimates');
    } finally {
      setLoading(false);
    }
  };

  // Helper: fetch items for a specific devis on demand
  const fetchItemsForDevis = async (devis) => {
    console.log('Fetching items for devis:', devis);
    if (!devis?.backendId) {
      console.warn('No backendId found for devis:', devis);
      return [];
    }
    try {
      const url = getApiUrl(`estimates/${devis.backendId}/items/`);
      console.log('Fetching items from URL:', url);
      const res = await api.get(url, { headers: authHeaders });
      console.log('API response for items:', res.data);
      
      const items = Array.isArray(res.data) ? res.data : [];
      console.log('Processed items:', items);
      
      return items.map(item => ({
        ...item,
        id: `item-${item.id}`,
        qty: parseFloat(item.qty) || 0,
        unit_price: parseFloat(item.unit_price) || 0,
        tva: parseFloat(item.tva) || 0,
        total_ht: parseFloat(item.total_ht) || 0
      }));
    } catch (e) {
      console.error('Error fetching items for devis:', e);
      console.warn(`Failed to load items for devis ${devis.backendId}`);
      return [];
    }
  };

  // Hydrate UI-only devis and items from storage on first mount (items only). Devis now come from backend.
  useEffect(() => {
    try {
      const savedDevis = null; // stop hydrating local devis list to avoid conflicts
      const savedItems = persist.get('itemsByDevis');
      // Devis list is fetched from backend instead
      if (savedItems) setItemsByDevis(JSON.parse(savedItems));
    } catch (e) {
      console.warn('Failed to parse saved devis/items from localStorage');
    }
    // Defer marking hydration complete to ensure state setters above are applied first
    setTimeout(() => setHydrationDone(true), 0);
  }, []);

  // Persist items to localStorage whenever they change (devis list comes from backend)
  useEffect(() => {
    if (!hydrationDone) return; // avoid overwriting storage with initial empty state
    try {
      persist.set('itemsByDevis', JSON.stringify(itemsByDevis));
    } catch (e) {
      console.warn('Failed to save devis/items to localStorage');
    }
  }, [itemsByDevis, hydrationDone]);

  const contractsForClient = useMemo(() => {
    if (!selectedClientId) return [];
    return contracts.filter(c => String(c.client_id) === String(selectedClientId));
  }, [contracts, selectedClientId]);

  // Auto-select most recent contract for selected client
  useEffect(() => {
    if (!selectedClientId) {
      setSelectedContractId('');
      return;
    }
    const list = contractsForClient;
    if (!list || list.length === 0) {
      setSelectedContractId('');
      return;
    }
    // Prefer max by date; fallback to highest id
    const withDate = list.filter(c => !!c.date);
    let chosen = null;
    if (withDate.length > 0) {
      chosen = withDate.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
    } else {
      chosen = list.reduce((a, b) => (a.id > b.id ? a : b));
    }
    setSelectedContractId(String(chosen.id));
  }, [selectedClientId, contractsForClient]);

  // Fetch details when contract changes
  useEffect(() => {
    if (!selectedContractId) {
      console.log('No contract ID selected');
      setDetails([]);
      return;
    }
    
    const fetchDetails = async () => {
      console.log(`Fetching details for contract ID: ${selectedContractId}`);
      setLoading(true);
      setError('');
      
      try {
        // Try the main endpoint first
        const url = getApiUrl(`contract-details/contracts/${selectedContractId}/`);
        console.log(`Fetching from: ${url}`);
        
        const res = await api.get(url, { 
          headers: { 
            ...authHeaders,
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status < 500 // Don't throw for 404
        });
        
        console.log('Contract details response:', res.data);
        setDetails(Array.isArray(res.data) ? res.data : [res.data]);
        
      } catch (e) {
        console.error('Error in fetchDetails:', {
          message: e.message,
          response: e.response?.data,
          status: e.response?.status,
          url: e.config?.url
        });
        
        // Try alternative endpoint if 404
        if (e.response?.status === 404) {
          try {
            console.log('Trying alternative endpoint...');
            const altUrl = getApiUrl(`contracts/${selectedContractId}/details/`);
            const altRes = await api.get(altUrl, { 
              headers: { 
                ...authHeaders,
                'Content-Type': 'application/json'
              }
            });
            console.log('Alternative endpoint response:', altRes.data);
            setDetails(Array.isArray(altRes.data) ? altRes.data : [altRes.data]);
            return;
          } catch (altErr) {
            console.error('Alternative endpoint failed:', altErr);
          }
        }
        
        setError(t('error_loading_data'));
        setDetails([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [authHeaders, selectedContractId, t]);

  
  // Fetch estimates after clients/contracts load
  useEffect(() => {
    fetchEstimates();
  }, [clients.length]);

  // Auto-calc total_ht with TVA
  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...detailsForm, [name]: value };
    
    // Always recalculate when any of these fields change
    if (['qty', 'unit_price', 'tva'].includes(name)) {
      const qty = parseFloat(updated.qty) || 0;
      const unitPrice = parseFloat(updated.unit_price) || 0;
      const tvaRate = (parseFloat(updated.tva) || 0) / 100; // Convert percentage to decimal
      
      const subtotal = qty * unitPrice;
      const tvaAmount = subtotal * tvaRate;
      updated.total_ht = (subtotal + tvaAmount).toFixed(2);
    }
    
    setDetailsForm(updated);
  };

  const openAddModal = () => {
    setEditingDetail(null);
    setDetailsForm({ description: '', qty: '', qty_unit: 'unite', unit_price: '', tva: '', total_ht: '' });
    setDetailsModalOpen(true);
    // Preselect a devis if one matches currently selected client
    if (createdDevis.length > 0) {
      const firstForClient = createdDevis.find(d => String(d.clientId) === String(selectedClientId));
      setSelectedDevisId(firstForClient ? firstForClient.id : createdDevis[0].id);
    } else {
      setSelectedDevisId('');
    }
  };

  const closeModal = () => setDetailsModalOpen(false);

  // Toggle items visibility for a specific devis
  const toggleItemsVisibility = async (devisId) => {
    const willExpand = !expandedItems[devisId];
    setExpandedItems(prev => ({ ...prev, [devisId]: willExpand }));
    
    if (willExpand) {
      console.log('Expanding devis:', devisId);
      const current = itemsByDevis[devisId];
      console.log('Current items in state:', current);
      
      // Always try to fetch fresh items when expanding, regardless of what's in state
      try {
        const devis = createdDevis.find(d => d.id === devisId);
        console.log('Found devis in createdDevis:', devis);
        
        if (devis) {
          console.log('Fetching fresh items for devis:', devis);
          const loaded = await fetchItemsForDevis(devis);
          console.log('Loaded items:', loaded);
          
          setItemsByDevis(prev => {
            console.log('Updating items in state for devis:', devisId);
            return { ...prev, [devisId]: loaded };
          });
        } else {
          console.warn('Devis not found in createdDevis:', devisId);
        }
      } catch (error) {
        console.error('Error loading items:', error);
      }
    }
  };

  // Delete an item from a devis
  const deleteItem = async (devisId, itemIndex) => {
    if (!window.confirm(t('confirm_delete_item') || 'Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    const devis = createdDevis.find(d => d.id === devisId);
    if (!devis || !devis.backendId) return;

    const item = itemsByDevis[devisId]?.[itemIndex];
    if (!item) return;

    const itemId = item.id?.replace('item-', '');
    if (!itemId) return;

    try {
      // Delete from backend
      await api.delete(
        getApiUrl(`estimates/${devis.backendId}/items/${itemId}/`),
        { headers: authHeaders }
      );

      // Update local state
      setItemsByDevis(prev => {
        const newItems = { ...prev };
        if (newItems[devisId]) {
          newItems[devisId] = newItems[devisId].filter((_, idx) => idx !== itemIndex);
        }
        return newItems;
      });

      setToast(t('item_deleted_successfully') || 'Article supprimé avec succès !');
      setTimeout(() => setToast(''), 2500);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(t('error_deleting_item') || 'Failed to delete item');
    }
  };

  // Start editing an item
  const startEditItem = (devisId, itemIndex, item) => {
    setEditingItem({ devisId, itemIndex });
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
      const tvaRate = (parseFloat(updatedForm.tva) || 0) / 100; // Convert percentage to decimal
      
      const subtotal = qty * unitPrice;
      const tvaAmount = subtotal * tvaRate;
      updatedForm.total_ht = (subtotal + tvaAmount).toFixed(2);
    }
    
    setEditItemForm(updatedForm);
  };

  // Save edited item
  const saveEditedItem = async () => {
    if (!editingItem) return;
    
    const devis = createdDevis.find(d => d.id === editingItem.devisId);
    if (!devis || !devis.backendId) return;
    
    const item = itemsByDevis[editingItem.devisId]?.[editingItem.itemIndex];
    if (!item) return;
    
    const itemId = item.id?.replace('item-', '');
    if (!itemId) return;
    
    const updatedItem = {
      description: editItemForm.description,
      qty: parseFloat(editItemForm.qty) || 0,
      qty_unit: editItemForm.qty_unit || 'unite',
      unit_price: parseFloat(editItemForm.unit_price) || 0,
      tva: parseFloat(editItemForm.tva) || 0,
      total_ht: parseFloat(editItemForm.total_ht) || 0,
      estimate_id: devis.backendId
    };
    
    try {
      // Update in backend
      await api.put(
        getApiUrl(`estimates/${devis.backendId}/items/${itemId}/`),
        updatedItem,
        { headers: authHeaders }
      );
      
      // Update local state
      setItemsByDevis(prev => {
        const newItems = { ...prev };
        newItems[editingItem.devisId][editingItem.itemIndex] = {
          ...updatedItem,
          id: item.id // Preserve the ID
        };
        return newItems;
      });
      
      setEditingItem(null);
      setEditItemForm({ description: '', qty: '', unit_price: '', tva: '', total_ht: '' });
      setToast(t('item_updated_successfully') || 'Article mis à jour avec succès !');
      setTimeout(() => setToast(''), 2500);
      
    } catch (error) {
      console.error('Error updating item:', error);
      setError(t('error_updating_item') || 'Failed to update item');
    }
  };

  // Cancel editing
  const cancelEditItem = () => {
    setEditingItem(null);
    setEditItemForm({ description: '', qty: '', unit_price: '', tva: '', total_ht: '' });
  };

  const refreshList = async () => {
    if (!selectedContractId) return;
    try {
      const res = await api.get(
        getApiUrl(`contract-details/contract/${selectedContractId}/`),
        { headers: authHeaders }
      );
      setDetails(res.data || []);
    } catch (e) {
      console.error('Refresh list failed', e);
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDevisId) {
      setError(t('select_devis_first') || 'Please select a Devis first.');
      return;
    }
    
    const devis = createdDevis.find(d => d.id === selectedDevisId);
    if (!devis || !devis.backendId) {
      setError('Invalid Devis selected');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const newItem = {
        description: detailsForm.description,
        qty: parseInt(detailsForm.qty) || 0,
        qty_unit: detailsForm.qty_unit || 'unite',
        unit_price: parseFloat(detailsForm.unit_price) || 0,
        tva: parseFloat(detailsForm.tva) || 0,
        total_ht: parseFloat(detailsForm.total_ht) || 0,
        estimate_id: devis.backendId
      };
      
      // Add to backend
      const response = await api.post(
        getApiUrl(`estimates/${devis.backendId}/items/`),
        newItem,
        { headers: authHeaders }
      );
      
      // Update local state
      const addedItem = {
        ...response.data,
        id: `item-${response.data.id}`,
        qty: parseFloat(response.data.qty) || 0,
        unit_price: parseFloat(response.data.unit_price) || 0,
        tva: parseFloat(response.data.tva) || 0,
        total_ht: parseFloat(response.data.total_ht) || 0
      };
      
      setItemsByDevis(prev => {
        const list = prev[selectedDevisId] ? [...prev[selectedDevisId]] : [];
        list.push(addedItem);
        return { ...prev, [selectedDevisId]: list };
      });

      // Persist to backend so Devis PDF (which reads contract_details) includes qty_unit
      try {
        if (selectedContractId) {
          await api.post(
            getApiUrl('contract-details/'),
            {
              contract_id: parseInt(selectedContractId),
              description: addedItem.description,
              qty: parseInt(addedItem.qty) || 0,
              qty_unit: addedItem.qty_unit || 'unite',
              unit_price: parseFloat(addedItem.unit_price) || 0,
              tva: parseFloat(addedItem.tva) || 0,
              total_ht: parseFloat(addedItem.total_ht) || 0,
            },
            { headers: { ...authHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (apiErr) {
        console.warn('Failed to persist devis item to backend (contract-details)', apiErr);
      }

      // Note: UI-only Devis; do not persist items to backend to avoid showing in Contracts/Factures

      setToast(t('document_saved'));
      setTimeout(() => setToast(''), 2500);

      // Reset and close
      setDetailsForm({ description: '', qty: '', qty_unit: 'unite', unit_price: '', tva: '', total_ht: '' });
      setDetailsModalOpen(false);
    } catch (err) {
      console.error('Error saving devis', err);
      setError(t('error_saving_data'));
    } finally {
      setLoading(false);
    }
  };

  // Open create devis modal
  const openCreateDevisModal = () => {
    setNewDevisNumber('');
    setNewDevisDate(new Date().toISOString().split('T')[0]);
    setIsCreateDevisModalOpen(true);
  };

  // Create new devis
  const handleCreateDevis = async () => {
    if (!selectedClientId || !newDevisNumber) return;
    try {
      const res = await api.post('estimates/', {
        estimate_number: newDevisNumber,
        client_id: parseInt(selectedClientId, 10),
        amount: 0,
        creation_date: newDevisDate,
        expiration_date: null,
        status: 'draft'
      }, { headers: authHeaders });
      const e = res.data;
      const mapped = {
        id: `devis-b-${e.id}`,
        backendId: e.id,
        name: e.estimate_number,
        clientId: e.client_id,
        date: e.creation_date,
        creationDate: e.creation_date,
        expiration: e.expiration_date || ''
      };
      setCreatedDevis(prev => [...prev, mapped]);
      setItemsByDevis(prev => ({ ...prev, [mapped.id]: [] }));
      setIsCreateDevisModalOpen(false);
    } catch (err) {
      console.error('Failed to create estimate', err);
      setError(t('error_saving_data'));
    }
  };

  // Update devis date
  const updateDevisDate = async (devisId, newDate) => {
    // Update backend if possible
    const row = createdDevis.find(d => d.id === devisId);
    const backendId = row?.backendId || (row?.id?.startsWith('devis-b-') ? parseInt(row.id.slice(8), 10) : null);
    if (backendId) {
      try {
        await api.put(`estimates/${backendId}/`, { creation_date: newDate }, { headers: authHeaders });
      } catch (err) {
        console.warn('Failed to persist devis date', err);
      }
    }
    setCreatedDevis(prev => prev.map(devis => devis.id === devisId ? { ...devis, creationDate: newDate, date: newDate } : devis));
  };

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
            {t('devis') || 'Devis'}
          </Typography>
          <Box sx={{ 
            width: 4, 
            height: 40, 
            background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
            borderRadius: 2 
          }} />
          <Chip 
            label={`${createdDevis.length} ${t('quotes') || 'Quotes'}`}
            sx={{ 
              ml: 2,
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>

        {/* Stats Overview */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} sx={{ color: '#333', mb: 3 }}>
            📊 {t('overview') || 'Aperçu'}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            <StatsCard>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {createdDevis.length}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {t('total_devis') || 'Total Devis'}
                </Typography>
              </CardContent>
            </StatsCard>
            
            <StatsCard sx={{ background: 'linear-gradient(135deg, #26c6da 0%, #00acc1 100%)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {clients.length}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {t('active_clients') || 'Clients Actifs'}
                </Typography>
              </CardContent>
            </StatsCard>
            
            <StatsCard sx={{ background: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {Object.keys(itemsByDevis).reduce((total, devisId) => total + (itemsByDevis[devisId]?.length || 0), 0)}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {t('total_items') || 'Total Articles'}
                </Typography>
              </CardContent>
            </StatsCard>
          </Box>
        </Box>

        {/* Selection Row */}
        <div className="contracts-card" style={{ marginBottom: '1rem' }}>
          <div className="contracts-form" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <select
                id="client_select"
                name="client_id"
                value={selectedClientId}
                onChange={(e) => { setSelectedClientId(e.target.value); setDetails([]); }}
                aria-label={t('client') || 'Client'}
              >
                <option value="">{t('select_client')}</option>
                {clients.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <label htmlFor="client_select">{t('client_name')}</label>
            </div>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '0.25rem' }}>
              <ActionButton
                variant="create"
                onClick={openCreateDevisModal}
                disabled={!selectedClientId}
                startIcon={<AddIcon />}
              >
                {t('create_devis') || 'Créer un devis'}
              </ActionButton>
            </Box>
          </div>
        </div>

        {/* Create Devis Modal */}
        {isCreateDevisModalOpen && (
          <div className="modal-overlay" onClick={() => setIsCreateDevisModalOpen(false)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
              background: 'white', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              width: '90%', maxWidth: '500px', padding: '1.5rem', overflow: 'auto', display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>{t('create_devis') || 'Créer un devis'}</h3>
                <IconButton onClick={() => setIsCreateDevisModalOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </div>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                  label={t('devis_number') || 'Numéro de devis'}
                  value={newDevisNumber}
                  onChange={(e) => setNewDevisNumber(e.target.value)}
                  fullWidth
                  required
                  size="small"
                />
                
                <TextField
                  label={t('creation_date') || 'Date de création'}
                  type="date"
                  value={newDevisDate}
                  onChange={(e) => setNewDevisDate(e.target.value)}
                  fullWidth
                  required
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setIsCreateDevisModalOpen(false)}
                  sx={{ color: '#666', borderColor: '#666' }}
                >
                  {t('cancel') || 'Annuler'}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCreateDevis}
                  disabled={!newDevisNumber}
                  sx={{ backgroundColor: '#9c27b0' }}
                >
                  {t('create') || 'Créer'}
                </Button>
              </Box>
            </div>
          </div>
        )}

        {/* Created Devis Cards */}
        {createdDevis.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={600} sx={{ color: '#333' }}>
                📋 {t('created_devis') || 'Devis Créés'}
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder={t('search_devis') || 'Rechercher des devis...'}
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
                  minWidth: '300px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
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
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, 
              gap: 3 
            }}>
              {filteredDevis.map(row => {
                const client = clients.find(x => String(x.value) === String(row.clientId));
                const dateStr = row.date ? new Date(row.date).toLocaleDateString() : '';
                const items = itemsByDevis[row.id] || [];
                const totalItems = items.length;
                const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.total_ht) || 0), 0);
                
                return (
                  <Fade in={true} key={row.id} timeout={300}>
                    <ModernCard>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" fontWeight={600} sx={{ color: '#333', mb: 1 }}>
                            {row.name}
                          </Typography>
                          <Chip 
                            label={`${totalItems} ${t('items') || 'articles'}`}
                            size="small"
                            sx={{ 
                              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon sx={{ color: '#9c27b0', mr: 1, fontSize: '1.2rem' }} />
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {client ? client.label : row.clientId}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                          <CalendarTodayIcon sx={{ color: '#9c27b0', fontSize: '1.2rem', flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ color: '#666', minWidth: '100px' }}>
                            {t('created') || 'Créé'}:
                          </Typography>
                          <input
                            type="date"
                            value={row.creationDate || new Date(row.date).toISOString().split('T')[0]}
                            onChange={(e) => updateDevisDate(row.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              color: '#333',
                              backgroundColor: '#fff',
                              flex: 1,
                              maxWidth: '160px',
                              '&:focus': {
                                outline: 'none',
                                borderColor: '#9c27b0',
                                boxShadow: '0 0 0 1px #9c27b0'
                              }
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CalendarTodayIcon sx={{ color: '#f44336', mr: 1, fontSize: '1.2rem' }} />
                          <input
                            type="date"
                            value={(() => {
                              const toInputDate = (val) => {
                                if (!val) return '';
                                if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
                                const d = new Date(val);
                                if (isNaN(d)) return '';
                                const yyyy = d.getFullYear();
                                const mm = String(d.getMonth() + 1).padStart(2, '0');
                                const dd = String(d.getDate()).padStart(2, '0');
                                return `${yyyy}-${mm}-${dd}`;
                              };
                              return toInputDate(row.expiration);
                            })()}
                            onChange={async (e) => {
                              const newVal = e.target.value || '';
                              setCreatedDevis(prev => {
                                const next = prev.map(d => d.id === row.id ? { ...d, expiration: newVal } : d);
                                return next;
                              });
                              // Persist to backend estimates so it survives refresh
                              try {
                                const backendId = row.backendId || (row.id?.startsWith('devis-b-') ? parseInt(row.id.slice(8), 10) : null);
                                if (backendId) {
                                  await api.put(`estimates/${backendId}/`, { expiration_date: newVal }, { headers: authHeaders });
                                }
                              } catch (err) {
                                console.warn('Failed to persist expiration_date', err);
                              }
                            }}
                            style={{ 
                              padding: '0.5rem', 
                              border: '1px solid #ddd', 
                              borderRadius: '8px',
                              fontSize: '0.9rem'
                            }}
                          />
                        </Box>
                        
                        {totalValue > 0 && (
                          <Box sx={{ 
                            backgroundColor: alpha('#9c27b0', 0.1), 
                            padding: '0.75rem', 
                            borderRadius: '8px', 
                            mb: 2 
                          }}>
                            <Typography variant="body2" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                              {t('total_value') || 'Valeur Totale'}: {totalValue.toFixed(2)} €
                            </Typography>
                          </Box>
                        )}

                        {/* Items Toggle Button */}
                        {items.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Button
                              onClick={() => toggleItemsVisibility(row.id)}
                              startIcon={expandedItems[row.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              sx={{
                                color: '#9c27b0',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                '&:hover': {
                                  backgroundColor: alpha('#9c27b0', 0.1),
                                }
                              }}
                            >
                              {expandedItems[row.id] ? (t('hide_items') || 'Masquer les Articles') : `${t('show_items') || 'Afficher les Articles'} (${items.length})`}
                            </Button>
                          </Box>
                        )}

                        {/* Items List - Collapsible */}
                        {items.length > 0 && expandedItems[row.id] && (
                          <Fade in={true}>
                            <Box sx={{ 
                              backgroundColor: '#f8f9fa', 
                              borderRadius: '8px', 
                              p: 2, 
                              mb: 2 
                            }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                                📋 {t('items') || 'Articles'} ({items.length})
                              </Typography>
                              <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {items.map((item, idx) => (
                                  <Box key={idx} sx={{ 
                                    borderBottom: idx < items.length - 1 ? '1px solid #e0e0e0' : 'none',
                                    py: 1
                                  }}>
                                    {editingItem && editingItem.devisId === row.id && editingItem.itemIndex === idx ? (
                                      // Edit mode
                                      <Box sx={{ p: 2, backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                                          ✏️ {t('editing_item') || 'Modification de l\'Article'}
                                        </Typography>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                                          <TextField
                                            label={t('description') || 'Description'}
                                            name="description"
                                            value={editItemForm.description}
                                            onChange={handleEditItemChange}
                                            size="small"
                                            fullWidth
                                            multiline
                                            rows={3}
                                            variant="outlined"
                                            sx={{ 
                                              gridColumn: 'span 2',
                                              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#9c27b0',
                                              },
                                              '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#9c27b0',
                                              },
                                            }}
                                            InputLabelProps={{
                                              shrink: true,
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' && e.shiftKey) {
                                                e.stopPropagation();
                                              } else if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                              }
                                            }}
                                          />
                                          <TextField
                                            label={t('quantity') || 'Quantité'}
                                            name="qty"
                                            type="number"
                                            value={editItemForm.qty}
                                            onChange={handleEditItemChange}
                                            size="small"
                                            inputProps={{ min: 0 }}
                                          />
                                          <FormControl size="small">
                                            <InputLabel id="edit-qty-unit-label">Unit</InputLabel>
                                            <Select
                                              labelId="edit-qty-unit-label"
                                              name="qty_unit"
                                              value={editItemForm.qty_unit || 'unite'}
                                              onChange={handleEditItemChange}
                                              label="Unit"
                                            >
                                              <MenuItem value="unite">Unité</MenuItem>
                                              <MenuItem value="ensemble">Ensemble</MenuItem>
                                              <MenuItem value="meter">m</MenuItem>
                                            </Select>
                                          </FormControl>
                                          <TextField
                                            label={t('unit_price_euro') || 'Prix Unitaire (€)'}
                                            name="unit_price"
                                            type="number"
                                            value={editItemForm.unit_price}
                                            onChange={handleEditItemChange}
                                            size="small"
                                            inputProps={{ min: 0, step: 0.01 }}
                                          />
                                          <TextField
                                            label="TVA (%)"
                                            name="tva"
                                            type="number"
                                            value={editItemForm.tva}
                                            onChange={handleEditItemChange}
                                            size="small"
                                            inputProps={{ min: 0, step: 0.01 }}
                                          />
                                          <TextField
                                            label={t('total_ht_euro') || 'Total HT (€)'}
                                            name="total_ht"
                                            type="number"
                                            value={editItemForm.total_ht}
                                            onChange={handleEditItemChange}
                                            size="small"
                                            inputProps={{ min: 0, step: 0.01 }}
                                          />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={cancelEditItem}
                                            sx={{ color: '#666', borderColor: '#666' }}
                                          >
                                            {t('cancel') || 'Annuler'}
                                          </Button>
                                          <Button
                                            variant="contained"
                                            size="small"
                                            onClick={saveEditedItem}
                                            sx={{ backgroundColor: '#1976d2' }}
                                          >
                                            {t('save') || 'Enregistrer'}
                                          </Button>
                                        </Box>
                                      </Box>
                                    ) : (
                                      // Display mode
                                      <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center'
                                      }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                                            {item.description}
                                          </Typography>
                                          <Typography variant="caption" sx={{ color: '#666' }}>
                                            {(() => {
                                              const unit = item.qty_unit || 'unite';
                                              const qty = Number(item.qty) || 0;
                                              let label = 'unités';
                                              if (unit === 'meter') label = 'm';
                                              else if (unit === 'ensemble') label = qty === 1 ? 'ensemble' : 'ensembles';
                                              else label = qty === 1 ? 'unité' : 'unités';
                                              return `${t('qty') || 'Qté'}: ${qty} ${label} × ${Number(item.unit_price).toFixed(2)} € | TVA: ${Number(item.tva).toFixed(2)}%`;
                                            })()}
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                                            €{Number(item.total_ht).toFixed(2)} €
                                          </Typography>
                                          <IconButton
                                            size="small"
                                            onClick={() => startEditItem(row.id, idx, item)}
                                            sx={{ 
                                              color: '#1976d2',
                                              '&:hover': { backgroundColor: alpha('#1976d2', 0.1) }
                                            }}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={() => deleteItem(row.id, idx)}
                                            sx={{ 
                                              color: '#f44336',
                                              '&:hover': { backgroundColor: alpha('#f44336', 0.1) }
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          </Fade>
                        )}

                        {items.length === 0 && (
                          <Box sx={{ 
                            backgroundColor: '#fff3cd', 
                            borderRadius: '8px', 
                            p: 2, 
                            mb: 2,
                            textAlign: 'center'
                          }}>
                            <Typography variant="body2" sx={{ color: '#856404' }}>
                              {t('no_items_added_yet') || 'Aucun article ajouté pour le moment. Utilisez le bouton + pour ajouter des articles à ce devis.'}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                      
                      <CardActions sx={{ px: 3, pb: 3, display: 'flex', gap: 1 }}>
                        <ActionButton
                          variant="view"
                          onClick={async () => {
                            try {
                              const client = clientsById[row.clientId] || {};
                              const creationDate = row.creationDate || (row.date ? new Date(row.date).toISOString().split('T')[0] : '');
                              const items = (itemsByDevis[row.id] || []).map(it => ({
                                description: it.description,
                                qty: Number(it.qty) || 0,
                                qty_unit: it.qty_unit || 'unite',
                                unit_price: Number(it.unit_price) || 0,
                                tva: Number(it.tva) || 0,
                                total_ht: Number(it.total_ht) || ((Number(it.qty)||0)*(Number(it.unit_price)||0))
                              }));

                              const payload = {
                                name: row.name,
                                client: {
                                  ...client,
                                  tsa_number: client.tsa_number || '',
                                  client_address: client.client_address || ''
                                },
                                items: items,
                                expiration: row.expiration || '',
                                devis_number: row.devis_number || row.name,
                                creation_date: creationDate
                              };
                              // Convert payload to query parameters
                              const queryParams = new URLSearchParams();
                              
                              // Add name, devis number, and expiration to query params
                              queryParams.append('name', payload.name);
        
                              // Use the exact devis_number from payload if available
                              if (payload.devis_number) {
                                queryParams.append('devis_number', payload.devis_number);
                              } else {
                                // Fallback to extracting from name if devis_number is not in payload
                                const devisNumberMatch = payload.name.match(/^Devis\s+([^-]+?)(\s+-|$)/);
                                if (devisNumberMatch && devisNumberMatch[1]) {
                                  const customNumber = devisNumberMatch[1].trim();
                                  queryParams.append('devis_number', customNumber);
                                }
                              }
                              
                              if (payload.expiration) {
                                queryParams.append('expiration', payload.expiration);
                              }
                              
                              if (payload.creation_date) {
                                queryParams.append('creation_date', payload.creation_date);
                              }
                              // Add contract_id to allow backend to fetch contract_details when items are empty
                              if (selectedContractId) {
                                queryParams.append('contract_id', selectedContractId);
                              }
                              
                              // Add client details
                              if (payload.client) {
                                // Ensure all client fields are properly encoded
                                const clientFields = {
                                  'name': payload.client.name || '',
                                  'email': payload.client.email || '',
                                  'phone': payload.client.phone || '',
                                  'tva': payload.client.tva || '',
                                  'tsa_number': payload.client.tsa_number || '',
                                  'client_address': payload.client.client_address || ''
                                };
                                
                                // Add client fields to query params
                                Object.entries(clientFields).forEach(([key, value]) => {
                                  if (value !== undefined && value !== null && value !== '') {
                                    queryParams.append(`client[${key}]`, value);
                                  }
                                });
                              }
                              
                              // Add items
                              if (payload.items && Array.isArray(payload.items)) {
                                payload.items.forEach((item, index) => {
                                  const itemFields = {
                                    'description': item.description || '',
                                    'qty': item.qty || 0,
                                    'qty_unit': item.qty_unit || 'unite',
                                    'unit_price': item.unit_price || 0,
                                    'tva': item.tva || 0,
                                    'total_ht': item.total_ht || 0
                                  };
                                  
                                  // Add item fields to query params
                                  Object.entries(itemFields).forEach(([key, value]) => {
                                    if (value !== undefined && value !== null) {
                                      queryParams.append(`items[${index}][${key}]`, value);
                                    }
                                  });
                                });
                              }
                              
                              // Log the payload and URL for debugging
                              console.log('Full Payload:', JSON.stringify(payload, null, 2));
                              const pdfUrl = `${getApiUrl('pdf/generate_devis/')}?${queryParams.toString()}`;
                              console.log('PDF Generation URL:', pdfUrl);
                              console.log('Query Parameters:');
                              queryParams.forEach((value, key) => {
                                console.log(`  ${key} = ${value}`);
                              });
                              
                              // Make GET request with query parameters
                              const res = await api.get(pdfUrl, { 
                                responseType: 'blob',
                                headers: { 
                                  'Accept': 'application/pdf',
                                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                                  'Pragma': 'no-cache',
                                  'Expires': '0'
                                },
                                timeout: 60000 // 60 seconds timeout
                              });

                              if (res.status === 200 && res.data) {
                                // Extract filename from content-disposition header or use a default one
                                let filename = 'invoice.pdf';
                                const contentDisposition = res.headers['content-disposition'];
                                if (contentDisposition) {
                                  const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                                  if (filenameMatch && filenameMatch[1]) {
                                    filename = filenameMatch[1].replace(/['"]/g, '');
                                  }
                                } else {
                                  // Fallback to using the invoice number if available
                                  const invoiceNumber = payload.devis_number || new URLSearchParams(window.location.search).get('invoice_number');
                                  filename = `invoice_${invoiceNumber || new Date().toISOString().split('T')[0]}.pdf`;
                                }

                                // Create a blob URL for the PDF
                                const blob = new Blob([res.data], { type: 'application/pdf' });
                                const url = window.URL.createObjectURL(blob);
                                
                                // Create a temporary anchor element to trigger download
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                                
                                // Cleanup
                                setTimeout(() => {
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                }, 100);
                              } else {
                                console.error('Invalid response:', res);
                                throw new Error('Failed to generate PDF: Invalid response from server');
                              }
                            } catch (err) {
                              console.error('Failed to generate PDF', err);
                              setError(t('error_generating_pdf') || 'Échec de la génération du PDF');
                            }
                          }}
                          startIcon={<VisibilityIcon />}
                          size="small"
                        >
{t('view_pdf') || 'Voir PDF'}
                        </ActionButton>
                        
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={async () => {
                            if (!window.confirm(t('confirm_delete') || 'Êtes-vous sûr de vouloir supprimer ce devis ?')) return;
                            // Delete from backend if possible
                            try {
                              const backendId = row.backendId || (row.id?.startsWith('devis-b-') ? parseInt(row.id.slice(8), 10) : null);
                              if (backendId) {
                                await api.delete(`estimates/${backendId}/`, { headers: authHeaders });
                              }
                            } catch (err) {
                              console.warn('Failed to delete backend estimate', err);
                            }
                            // Update local state
                            setCreatedDevis(prev => prev.filter(d => d.id !== row.id));
                            setItemsByDevis(prev => {
                              const copy = { ...prev };
                              delete copy[row.id];
                              try { persist.set('itemsByDevis', JSON.stringify(copy)); } catch {}
                              return copy;
                            });
                            // Optionally refresh list from backend to ensure sync
                            try { await fetchEstimates(); } catch {}
                          }}
                          sx={{ 
                            borderRadius: '12px',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            }
                          }}
                        >
{t('delete') || 'Supprimer'}
                        </Button>
                      </CardActions>
                    </ModernCard>
                  </Fade>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Devis items list intentionally removed as requested */}

        {/* Success/Error Messages */}
        {error && (
          <Fade in={true}>
            <Box sx={{ 
              mb: 3, 
              p: 2.5, 
              backgroundColor: alpha('#f44336', 0.1),
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#f44336', 0.2),
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box sx={{ 
                width: 4, 
                height: 40, 
                backgroundColor: '#f44336',
                borderRadius: 1,
                mr: 2
              }} />
              <Typography color="error" fontWeight={500}>{error}</Typography>
            </Box>
          </Fade>
        )}
        {toast && (
          <Fade in={true}>
            <Box sx={{ 
              mb: 3, 
              p: 2.5, 
              backgroundColor: alpha('#4caf50', 0.1),
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#4caf50', 0.2),
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box sx={{ 
                width: 4, 
                height: 40, 
                backgroundColor: '#4caf50',
                borderRadius: 1,
                mr: 2
              }} />
              <Typography color="success.main" fontWeight={500}>{toast}</Typography>
            </Box>
          </Fade>
        )}

        {/* Add Devis Item Button (FAB) */}
        <Zoom in={true} timeout={500}>
          <Tooltip title={t('add_devis_item') || 'Ajouter un Article de Devis'} arrow placement="left">
            <AddButton 
              color="primary" 
              aria-label={t('add_devis_item') || 'ajouter un article de devis'}
              onClick={openAddModal}
              disabled={!selectedClientId || createdDevis.length === 0}
            >
              <AddIcon sx={{ fontSize: '28px' }} />
            </AddButton>
          </Tooltip>
        </Zoom>

        {/* Modal */}
        {detailsModalOpen && (
          <div className="modal-overlay" onClick={closeModal} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
              background: 'white', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              width: '90vw', maxWidth: '700px', maxHeight: '90vh', padding: '1.5rem', overflow: 'auto', display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{editingDetail ? (t('edit_devis_item') || 'Modifier l\'Article de Devis') : (t('add_devis_item') || 'Ajouter un Article de Devis')}</h3>
                <IconButton onClick={closeModal} size="small"><CloseIcon /></IconButton>
              </div>

              <form onSubmit={handleDetailsSubmit} className="contracts-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <select id="devis_select" name="devis_id" value={selectedDevisId} onChange={(e) => setSelectedDevisId(e.target.value)} required>
                      <option value="">{t('select_devis') || 'Sélectionner un Devis'}</option>
                      {createdDevis.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <label htmlFor="devis_select">{t('devis') || 'Devis'}</label>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <textarea 
                      id="devis_description" 
                      name="description" 
                      value={detailsForm.description} 
                      onChange={handleDetailsChange} 
                      placeholder=" " 
                      required 
                      rows="3"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey) {
                          // Allow Shift+Enter for new line
                          e.stopPropagation();
                        } else if (e.key === 'Enter' && !e.shiftKey) {
                          // Prevent regular Enter from submitting form
                          e.preventDefault();
                        }
                      }}
                      style={{
                        resize: 'vertical',
                        minHeight: '60px',
                        fontFamily: 'inherit',
                        fontSize: 'inherit'
                      }}
                    />
                    <label htmlFor="devis_description">{t('description')}</label>
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <input id="devis_qty" name="qty" type="number" min="0" value={detailsForm.qty} onChange={handleDetailsChange} placeholder=" " required />
                      <label htmlFor="devis_qty">{t('qty')}</label>
                    </div>
                    <div style={{ minWidth: '120px' }}>
                      <select id="devis_qty_unit" name="qty_unit" value={detailsForm.qty_unit || 'unite'} onChange={handleDetailsChange}>
                        <option value="unite">Unité</option>
                        <option value="ensemble">Ensemble</option>
                        <option value="meter">m</option>
                      </select>
                      <label htmlFor="devis_qty_unit">Unit</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <input id="devis_unit_price" name="unit_price" type="number" min="0" step="0.01" value={detailsForm.unit_price} onChange={handleDetailsChange} placeholder=" " required />
                    <label htmlFor="devis_unit_price">{t('unit_price')}</label>
                  </div>
                  <div className="form-group">
                    <input id="devis_tva" name="tva" type="number" min="0" step="0.01" value={detailsForm.tva} onChange={handleDetailsChange} placeholder=" " required />
                    <label htmlFor="devis_tva">{t('tva_percent')}</label>
                  </div>
                  <div className="form-group">
                    <input id="devis_total_ht" name="total_ht" type="number" min="0" step="0.01" value={detailsForm.total_ht} onChange={handleDetailsChange} placeholder=" " required />
                    <label htmlFor="devis_total_ht">{t('total_ht')}</label>
                  </div>
                </div>
                <div className="form-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-secondary" onClick={closeModal} style={{ padding: '0.6rem 1rem' }}>{t('cancel') || 'Annuler'}</button>
                  <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.6rem 1rem', background: '#4caf50', color: 'white' }}>
                    {loading ? (t('saving') || 'Enregistrement...') : (t('save_in_devis') || 'Enregistrer dans le Devis')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Box>
    </Box>
  );
};

export default Devis;
