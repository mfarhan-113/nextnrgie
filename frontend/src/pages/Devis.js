import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '../config/api';

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
  const [createdDevis, setCreatedDevis] = useState([]); // { id, name, clientId, date, expiration }
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
          axios.get(getApiUrl('clients/'), { headers: authHeaders }),
          axios.get(getApiUrl('contracts/'), { headers: authHeaders })
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

  // Hydrate UI-only devis and items from storage on first mount
  useEffect(() => {
    try {
      const savedDevis = persist.get('createdDevis');
      const savedItems = persist.get('itemsByDevis');
      if (savedDevis) {
        const parsed = JSON.parse(savedDevis);
        // Normalize expiration to 'YYYY-MM-DD'
        const normalized = Array.isArray(parsed) ? parsed.map(d => {
          const exp = d.expiration;
          let out = '';
          if (typeof exp === 'string' && exp.length > 0) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(exp)) {
              out = exp;
            } else {
              const dt = new Date(exp);
              if (!isNaN(dt)) {
                const yyyy = dt.getFullYear();
                const mm = String(dt.getMonth() + 1).padStart(2, '0');
                const dd = String(dt.getDate()).padStart(2, '0');
                out = `${yyyy}-${mm}-${dd}`;
              }
            }
          }
          return { ...d, expiration: out };
        }) : parsed;
        setCreatedDevis(normalized);
        try { persist.set('createdDevis', JSON.stringify(normalized)); } catch {}
      }
      if (savedItems) setItemsByDevis(JSON.parse(savedItems));
    } catch (e) {
      console.warn('Failed to parse saved devis/items from localStorage');
    }
    // Defer marking hydration complete to ensure state setters above are applied first
    setTimeout(() => setHydrationDone(true), 0);
  }, []);

  // Persist UI-only devis and items to localStorage whenever they change
  useEffect(() => {
    if (!hydrationDone) return; // avoid overwriting storage with initial empty state
    try {
      persist.set('createdDevis', JSON.stringify(createdDevis));
      persist.set('itemsByDevis', JSON.stringify(itemsByDevis));
    } catch (e) {
      console.warn('Failed to save devis/items to localStorage');
    }
  }, [createdDevis, itemsByDevis, hydrationDone]);

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
        const url = getApiUrl(`contract-details/contracts/${selectedContractId}`);
        console.log(`Fetching from: ${url}`);
        
        const res = await axios.get(url, { 
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
            const altUrl = getApiUrl(`contracts/${selectedContractId}/details`);
            const altRes = await axios.get(altUrl, { 
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
  const toggleItemsVisibility = (devisId) => {
    setExpandedItems(prev => ({
      ...prev,
      [devisId]: !prev[devisId]
    }));
  };

  // Delete an item from a devis
  const deleteItem = (devisId, itemIndex) => {
    if (window.confirm(t('confirm_delete_item') || 'Êtes-vous sûr de vouloir supprimer cet article ?')) {
      setItemsByDevis(prev => {
        const newItems = { ...prev };
        newItems[devisId] = newItems[devisId].filter((_, idx) => idx !== itemIndex);
        try { persist.set('itemsByDevis', JSON.stringify(newItems)); } catch {}
        return newItems;
      });
      setToast(t('item_deleted_successfully') || 'Article supprimé avec succès !');
      setTimeout(() => setToast(''), 2500);
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
  const saveEditedItem = () => {
    if (!editingItem) return;
    
    setItemsByDevis(prev => {
      const newItems = { ...prev };
      newItems[editingItem.devisId][editingItem.itemIndex] = {
        description: editItemForm.description,
        qty: parseFloat(editItemForm.qty) || 0,
        qty_unit: editItemForm.qty_unit || 'unite',
        unit_price: parseFloat(editItemForm.unit_price) || 0,
        tva: parseFloat(editItemForm.tva) || 0,
        total_ht: parseFloat(editItemForm.total_ht) || 0
      };
      try { persist.set('itemsByDevis', JSON.stringify(newItems)); } catch {}
      return newItems;
    });
    
    setEditingItem(null);
    setEditItemForm({ description: '', qty: '', unit_price: '', tva: '', total_ht: '' });
    setToast(t('item_updated_successfully') || 'Article mis à jour avec succès !');
    setTimeout(() => setToast(''), 2500);
  };

  // Cancel editing
  const cancelEditItem = () => {
    setEditingItem(null);
    setEditItemForm({ description: '', qty: '', unit_price: '', tva: '', total_ht: '' });
  };

  const refreshList = async () => {
    if (!selectedContractId) return;
    try {
      const res = await axios.get(
        getApiUrl(`contract-details/contract/${selectedContractId}`),
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
    setLoading(true);
    setError('');

    try {
      const item = {
        description: detailsForm.description,
        qty: parseInt(detailsForm.qty) || 0,
        qty_unit: detailsForm.qty_unit || 'unite',
        unit_price: parseFloat(detailsForm.unit_price) || 0,
        tva: parseFloat(detailsForm.tva) || 0,
        total_ht: parseFloat(detailsForm.total_ht) || 0
      };
      setItemsByDevis(prev => {
        const list = prev[selectedDevisId] ? [...prev[selectedDevisId]] : [];
        list.push(item);
        const next = { ...prev, [selectedDevisId]: list };
        try { persist.set('itemsByDevis', JSON.stringify(next)); } catch {}
        return next;
      });

      // Persist to backend so Devis PDF (which reads contract_details) includes qty_unit
      try {
        if (selectedContractId) {
          await axios.post(
            getApiUrl('contract-details/'),
            {
              contract_id: parseInt(selectedContractId),
              description: item.description,
              qty: parseInt(item.qty) || 0,
              qty_unit: item.qty_unit || 'unite',
              unit_price: parseFloat(item.unit_price) || 0,
              tva: parseFloat(item.tva) || 0,
              total_ht: parseFloat(item.total_ht) || 0,
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

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
              <Tooltip title={t('add_devis_item') || 'Add Devis Item'}>
                <span>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!selectedClientId || !selectedContractId || loading}
                    onClick={openAddModal}
                    style={{
                      background: '#9c27b0',
                      color: 'white',
                      border: 'none',
                      padding: '0.6rem 1rem',
                      borderRadius: '6px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: !selectedClientId || !selectedContractId ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? <CircularProgress size={20} style={{ color: 'white' }} /> : <><AddIcon fontSize="small" style={{ marginRight: '0.5rem' }} /> +</>}
                  </button>
                </span>
              </Tooltip>
              {selectedClientId && !selectedContractId && (
                <div style={{ fontSize: '0.85rem', color: '#b00020' }}>
                  {t('no_contract_for_client') || 'No contract found for selected client. Create one in Contracts to add devis.'}
                </div>
              )}
            </div>
          </div>
          {/* Per-client Create Devis actions */}
          {clients.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <Typography variant="subtitle1" sx={{ color: '#7b1fa2', mb: 1 }}>
                {t('create_devis_for_client') || 'Create Devis for a client:'}
              </Typography>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: 6, padding: '0.5rem' }}>
                {clients.map(c => {
                  // Compute default expiration (today + 30 days) in yyyy-mm-dd
                  const today = new Date();
                  const defaultDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                  const yyyy = defaultDate.getFullYear();
                  const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
                  const dd = String(defaultDate.getDate()).padStart(2, '0');
                  const defaultDraft = `${yyyy}-${mm}-${dd}`;
                  const draftVal = expirationDrafts[String(c.value)] ?? defaultDraft;
                  return (
                    <div key={c.value} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0.5rem', gap: '0.5rem' }}>
                      <div style={{ color: '#333', flex: 1 }}>{c.label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555' }}>{t('expiration_date') || 'Expiration'}:</label>
                        <input
                          type="date"
                          value={draftVal}
                          onChange={(e) => setExpirationDrafts(prev => ({ ...prev, [String(c.value)]: e.target.value }))}
                          style={{ padding: '0.35rem 0.4rem' }}
                        />
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={async () => {
                            const now = new Date();
                            const dateStr = now.toLocaleDateString();
                            const name = `Devis ${c.label} ${dateStr}`;
                            const id = `${c.value}-${now.getTime()}`; // UI-only unique id
                            // Use drafted expiration or default, store as 'YYYY-MM-DD' to avoid timezone shifts
                            const expirationDateStr = expirationDrafts[String(c.value)] || defaultDraft;
                            setCreatedDevis(prev => {
                              const next = [{ id, name, clientId: c.value, date: now.toISOString(), expiration: expirationDateStr }, ...prev];
                              try { persist.set('createdDevis', JSON.stringify(next)); } catch {}
                              return next;
                            });
                            setItemsByDevis(prev => {
                              const next = { ...prev, [id]: (prev[id] || []) };
                              try { persist.set('itemsByDevis', JSON.stringify(next)); } catch {}
                              return next;
                            });
                          }}
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          {t('create_devis') || 'Create Devis'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarTodayIcon sx={{ color: '#9c27b0', mr: 1, fontSize: '1.2rem' }} />
                          <Typography variant="body2" sx={{ color: '#666' }}>
{t('created') || 'Créé'}: {dateStr}
                          </Typography>
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
                            onChange={(e) => {
                              const newVal = e.target.value || '';
                              setCreatedDevis(prev => {
                                const next = prev.map(d => d.id === row.id ? { ...d, expiration: newVal } : d);
                                try { persist.set('createdDevis', JSON.stringify(next)); } catch {}
                                return next;
                              });
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
                              const payload = {
                                name: row.name,
                                expiration: row.expiration,
                                devis_number: row.id,
                                client: {
                                  name: client.client_name || (clients.find(x => String(x.value) === String(row.clientId))?.label) || 'Client',
                                  email: client.email || '',
                                  phone: client.phone || '',
                                  tva: client.tva_number || '',
                                  tsa_number: client.tsa_number || '',
                                  client_address: client.client_address || ''
                                },
                                items: (itemsByDevis[row.id] || []).map(it => ({
                                  description: it.description,
                                  qty: Number(it.qty) || 0,
                                  qty_unit: it.qty_unit || 'unite',
                                  unit_price: Number(it.unit_price) || 0,
                                  tva: Number(it.tva) || 0,
                                  total_ht: Number(it.total_ht) || ((Number(it.qty)||0)*(Number(it.unit_price)||0))
                                }))
                              };
                              const res = await axios.post(`${process.env.REACT_APP_API_URL}/pdf/devis`, payload, {
                                responseType: 'blob',
                                headers: { 'Content-Type': 'application/json' }
                              });
                              const blob = new Blob([res.data], { type: 'application/pdf' });
                              const url = window.URL.createObjectURL(blob);
                              window.open(url, '_blank');
                              setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
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
                          onClick={() => {
                            if (window.confirm(t('confirm_delete') || 'Êtes-vous sûr de vouloir supprimer ce devis ?')) {
                              setCreatedDevis(prev => {
                                const next = prev.filter(d => d.id !== row.id);
                                try { persist.set('createdDevis', JSON.stringify(next)); } catch {}
                                return next;
                              });
                              setItemsByDevis(prev => {
                                const copy = { ...prev };
                                delete copy[row.id];
                                try { persist.set('itemsByDevis', JSON.stringify(copy)); } catch {}
                                return copy;
                              });
                            }
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
