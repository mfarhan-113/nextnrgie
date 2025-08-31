import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Material UI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { CssBaseline } from '@mui/material';

// Material UI Icons
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import WarningIcon from '@mui/icons-material/Warning';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import { People, Description, AccountBalance, AttachMoney, MoreHoriz, Dashboard as DashboardIcon } from '@mui/icons-material';

// Components
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// Styles
import '../modern-contracts.css';


const Contracts = () => {
  const { t } = useTranslation();
  // ...existing state
  const [detailsModal, setDetailsModal] = useState(null); // store contract id or null
  const [detailsForm, setDetailsForm] = useState({
    description: '',
    qty: '',
    unit_price: '',
    tva: '',
    total_ht: ''
  });
  const [contractDetails, setContractDetails] = useState({}); // { [contractId]: [details, ...] }

  // ...existing code

  // State for edit mode of contract details
  const [editingDetail, setEditingDetail] = useState(null);

  // Handlers for contract details modal
  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...detailsForm, [name]: value };
    
    // Auto-calculate total_ht when qty or unit_price changes
    if (name === 'qty' || name === 'unit_price') {
      const qty = name === 'qty' ? parseFloat(value) || 0 : parseFloat(detailsForm.qty) || 0;
      const unitPrice = name === 'unit_price' ? parseFloat(value) || 0 : parseFloat(detailsForm.unit_price) || 0;
      updatedForm.total_ht = (qty * unitPrice).toFixed(2);
    }
    
    setDetailsForm(updatedForm);
  };
  
  // Handle adding or updating contract detail
  const handleDetailsSubmit = async (e, contractId) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const detailData = {
        ...detailsForm,
        contract_id: contractId,
        qty: parseInt(detailsForm.qty),
        unit_price: parseFloat(detailsForm.unit_price),
        tva: parseFloat(detailsForm.tva),
        total_ht: parseFloat(detailsForm.total_ht)
      };
      
      if (editingDetail) {
        // Update existing detail
        console.log('Updating contract detail:', detailData);
        await axios.put(`${process.env.REACT_APP_API_URL}/contract-details/${editingDetail.id}`, detailData);
        setToast('Contract detail updated successfully');
      } else {
        // Add new detail
        console.log('Adding contract detail:', detailData);
        await axios.post(`${process.env.REACT_APP_API_URL}/contract-details/`, detailData);
        setToast('Contract detail added successfully');
      }
      
      // Reset form and close modal
      setDetailsForm({ description: '', qty: '', unit_price: '', tva: '', total_ht: '' });
      setEditingDetail(null);
      setDetailsModal(null);
      
      // Refresh contracts to get updated data
      await fetchContracts();
      
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Error saving contract detail:', err);
      setError(err.response?.data?.detail || 'Failed to save contract detail.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting a contract detail
  const handleDeleteDetail = async (detailId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/contract-details/${detailId}`);
      setToast('Contract detail deleted successfully');
      
      // Refresh contracts to get updated data
      await fetchContracts();
      
      // Reset form if deleting the currently edited item
      if (editingDetail && editingDetail.id === detailId) {
        setEditingDetail(null);
        setDetailsForm({ description: '', qty: '', unit_price: '', tva: '', total_ht: '' });
      }
      
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Error deleting contract detail:', err);
      setError(err.response?.data?.detail || 'Failed to delete contract detail.');
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ command_number: '', price: '', date: '', deadline: '', guarantee_percentage: '', contact_person: '', client_id: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState({ show: false, contract: null });
  const [editModal, setEditModal] = useState({ show: false, contract: null });
  const [pdfModal, setPdfModal] = useState({ show: false, url: '', title: '' });
  const [page, setPage] = useState(1);
  const [perPage] = useState(8);

  // Fetch contracts and clients
  const fetchContracts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/contracts/`);
      setContracts(res.data);
      
      // Fetch contract details for each contract
      const detailsObj = {};
      for (const contract of res.data) {
        try {
          const detailsRes = await axios.get(`${process.env.REACT_APP_API_URL}/contract-details/contract/${contract.id}`);
          if (detailsRes.data.length > 0) {
            detailsObj[contract.id] = detailsRes.data;
          }
        } catch (detailErr) {
          console.error(`Failed to load details for contract ${contract.id}:`, detailErr);
        }
      }
      
      setContractDetails(detailsObj);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError('Failed to load contracts: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };
  const fetchClients = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/clients/`);
      console.log('Clients data:', res.data); // Debug log
      
      // Map the clients data to the expected format
      const formattedClients = res.data.map(client => ({
        value: client.id,
        label: client.client_name || `Client #${client.client_number}`
      }));
      
      setClients(formattedClients);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setClients([]);
    }
  };
  useEffect(() => { fetchContracts(); fetchClients(); }, []);

  // Form handlers
  const handleChange = (e) => {
    if (e.target.name === 'client_id') {
      // When client is selected from dropdown, update client_id
      setForm({ ...form, client_id: e.target.value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // Edit form handlers
  const [editForm, setEditForm] = useState({ command_number: '', price: '', date: '', deadline: '', guarantee_percentage: '', contact_person: '', client_id: '' });
  const [editError, setEditError] = useState('');
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const openEditModal = (contract) => {
    setEditForm({
      command_number: contract.command_number || '',
      price: contract.price || '',
      date: contract.date || '',
      deadline: contract.deadline || '',
      guarantee_percentage: contract.guarantee_percentage || '',
      contact_person: contract.contact_person || '',
      client_id: contract.client_id || ''
    });
    setEditError('');
    setEditModal({ show: true, contract });
  };
  const closeEditModal = () => {
    setEditModal({ show: false, contract: null });
    setEditError('');
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.command_number || !editForm.price || !editForm.date || !editForm.deadline || !editForm.guarantee_percentage || !editForm.contact_person || !editForm.client_id) {
      setEditError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/contracts/${editModal.contract.id}`, editForm);
      setToast('Contract updated successfully!');
      fetchContracts();
      closeEditModal();
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Failed to update contract.');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 2500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.price || !form.date || !form.deadline || !form.guarantee_percentage || !form.contact_person || !form.client_id) {
      setError('All fields except command number are required.');
      return;
    }
    setLoading(true);
    setError(''); // Clear any previous errors
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/contracts/`, form);
      // If we get here, the contract was successfully created
      setToast('Contract added successfully!');
      setForm({ command_number: '', price: '', date: '', deadline: '', guarantee_percentage: '', contact_person: '', client_id: '' });
      await fetchContracts(); // Use await to ensure contracts are fetched before continuing
    } catch (err) {
      console.error('Error adding contract:', err);
      setError(err.response?.data?.detail || 'Failed to add contract.');
      // Even if there's an error, try to refresh contracts as the contract might have been created
      try {
        await fetchContracts();
      } catch (fetchErr) {
        console.error('Error fetching contracts after failed add:', fetchErr);
      }
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 2500);
    }
  };
  // PDF actions
  const handleViewPDF = (contract, type) => {
    setPdfModal({ show: true, url: `${process.env.REACT_APP_API_URL}/pdf/${type}/${contract.id}`, title: `${type === 'invoice' ? 'Invoice' : 'Estimate'} PDF` });
  };
  const handleDownloadPDF = async (contract, type) => {
    if (type !== 'invoice') {
      // For estimates, contract.id is correct
      window.open(`${process.env.REACT_APP_API_URL}/pdf/${type}/${contract.id}`, '_blank');
      setToast('Estimate downloaded.');
      setTimeout(() => setToast(''), 2000);
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch all invoices and filter by contract_id
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/invoices/`);
      let invoice = res.data.find(inv => inv.contract_id === contract.id);
      // 2. If not found, create one
      if (!invoice) {
        // Generate a unique invoice number (e.g., INV-<command_number>-<timestamp>)
        const invoiceNumber = `INV-${contract.command_number}-${Date.now()}`;
        const createRes = await axios.post(`${process.env.REACT_APP_API_URL}/invoices/`, {
          invoice_number: invoiceNumber,
          contract_id: contract.id,
          amount: contract.price,
          due_date: contract.deadline
          // status: 'unpaid' // optional, backend defaults to 'unpaid'
        });
        invoice = createRes.data;
      }
      // 3. Open PDF using invoice.id
      if (invoice && invoice.id) {
        window.open(`${process.env.REACT_APP_API_URL}/pdf/invoice/${invoice.id}`, '_blank');
        setToast('Invoice downloaded.');
      } else {
        setToast('Failed to get invoice ID.');
      }
    } catch (err) {
      setToast('Error generating/downloading invoice.');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 2000);
    }
  };
  const handleDelete = async () => {
    if (!modal.contract) return;
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/contracts/${modal.contract.id}`);
      setToast('Contract deleted.');
      fetchContracts();
    } catch (err) {
      setError('Failed to delete contract.');
    } finally {
      setLoading(false);
      setModal({ show: false, contract: null });
      setTimeout(() => setToast(''), 2500);
    }
  };

  // Filtering, search, pagination
  const filtered = contracts.filter(
    (c) => c.command_number?.toLowerCase().includes(search.toLowerCase())
      || c.contact_person?.toLowerCase().includes(search.toLowerCase())
      || clients.find(cl => cl.value === c.client_id)?.label?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // Expired contract check
  const isExpired = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(120deg,#f4f6f8 60%,#e3e9f7 100%)' }}>
      <CssBaseline />
      {/* Unified Navbar */}
      <Navbar handleDrawerToggle={handleDrawerToggle} />
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, px: { xs: 1, md: 4 }, mt: { xs: 7.5, md: 8 }, pb: 4, minHeight: '100vh', transition: 'all 0.3s', background: 'rgba(255,255,255,0.7)', boxShadow: { md: 3, xs: 0 } }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#9c27b0', mb: 2 }}>
          Contracts <Typography component="span" variant="h5" fontWeight={500} sx={{ color: '#4caf50', ml: 1, fontSize: '1.2rem', display: 'inline' }}>({contracts.length})</Typography>
        </Typography>
        {/* Add Contract Form */}
        <div className="contracts-card">
          <h2><Description /> {t('add_contract')}</h2>
          <form className="contracts-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <input 
                id="command_number" 
                name="command_number" 
                value={form.command_number} 
                onChange={handleChange} 
                placeholder=" " 
                required 
                aria-label="Command Number"
              />
              <label htmlFor="command_number">{t('command_number')}</label>
            </div>
            <div className="form-group">
              <input 
                id="price" 
                name="price" 
                type="number" 
                value={form.price} 
                onChange={handleChange} 
                placeholder=" " 
                required 
                aria-label="Price"
              />
              <label htmlFor="price">{t('price')}</label>
            </div>
            <div className="form-group">
              <input 
                id="date" 
                name="date" 
                type="date" 
                value={form.date} 
                onChange={handleChange} 
                required 
                aria-label="Date"
              />
              <label htmlFor="date">{t('date')}</label>
            </div>
            <div className="form-group">
              <input 
                id="deadline" 
                name="deadline" 
                type="date" 
                value={form.deadline} 
                onChange={handleChange} 
                required 
                aria-label="Deadline"
              />
              <label htmlFor="deadline">{t('deadline')}</label>
            </div>
            <div className="form-group">
              <input 
                id="guarantee_percentage" 
                name="guarantee_percentage" 
                type="number" 
                min="0" 
                max="100" 
                value={form.guarantee_percentage} 
                onChange={handleChange} 
                placeholder=" " 
                required 
                aria-label="Guarantee Percentage"
              />
              <label htmlFor="guarantee_percentage">{t('guarantee_percentage')}</label>
            </div>
            <div className="form-group">
              <input 
                id="contact_person" 
                name="contact_person" 
                value={form.contact_person} 
                onChange={handleChange} 
                placeholder=" " 
                required 
                aria-label="Contact Person"
              />
              <label htmlFor="contact_person">{t('contact_person')}</label>
            </div>
            <div className="form-group">
              <select 
                id="client_id" 
                name="client_id" 
                value={form.client_id} 
                onChange={handleChange} 
                required 
                aria-label="Client Name"
              >
                <option value="">{t('select_client')}</option>
                {clients.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <label htmlFor="client_id">{t('client_name')}</label>
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                style={{
                  background: '#9c27b0',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                {loading ? <CircularProgress size={20} style={{ color: 'white' }} /> : <><AddIcon fontSize="small" style={{ marginRight: '0.5rem' }} /> Add Contract</>}
              </button>
            </div>
          </form>
          {error && <div className="text-error">{error}</div>}
        </div>

        {/* Contract Table */}

        {/* Contract Details Modal */}
        {detailsModal !== null && (
          <div className="modal-overlay" onClick={() => setDetailsModal(null)} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            padding: '20px',
            overflow: 'auto'
          }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              width: '98vw',
              maxWidth: '1400px',
              maxHeight: '95vh',
              padding: '1.5rem',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              margin: '1rem',
              boxSizing: 'border-box'
            }}>
              <h3 style={{ 
                color: '#9c27b0', 
                fontSize: '1.5rem', 
                fontWeight: '600',
                marginTop: 0,
                marginBottom: '1.5rem',
                borderBottom: '2px solid #9c27b0',
                paddingBottom: '0.5rem',
                width: 'fit-content'
              }}>{t('add_contract_details')}</h3>
              <div className="contracts-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: 'span 2' }}>
                    <label htmlFor="detail_description" style={{ color: '#9c27b0', fontWeight: '500', fontSize: '0.875rem' }}>{t('description')}</label>
                    <input 
                      id="detail_description" 
                      name="description" 
                      value={detailsForm.description} 
                      onChange={handleDetailsChange} 
                      required 
                      aria-label="Description"
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="detail_qty" style={{ color: '#9c27b0', fontWeight: '500', fontSize: '0.875rem' }}>{t('quantity')}</label>
                    <input 
                      id="detail_qty" 
                      name="qty" 
                      type="number" 
                      min="1" 
                      value={detailsForm.qty} 
                      onChange={handleDetailsChange} 
                      required 
                      aria-label="Quantity"
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="detail_unit_price" style={{ color: '#9c27b0', fontWeight: '500', fontSize: '0.875rem' }}>{t('unit_price')}</label>
                    <input 
                      id="detail_unit_price" 
                      name="unit_price" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={detailsForm.unit_price} 
                      onChange={handleDetailsChange} 
                      required 
                      aria-label="Unit Price"
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="detail_tva" style={{ color: '#9c27b0', fontWeight: '500', fontSize: '0.875rem' }}>{t('tva_percent')}</label>
                    <input 
                      id="detail_tva" 
                      name="tva" 
                      type="number" 
                      min="0" 
                      max="100" 
                      step="0.01" 
                      value={detailsForm.tva} 
                      onChange={handleDetailsChange} 
                      required 
                      aria-label="TVA (%)"
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="detail_total_ht" style={{ color: '#9c27b0', fontWeight: '500', fontSize: '0.875rem' }}>{t('total_ht')}</label>
                    <input 
                      id="detail_total_ht" 
                      name="total_ht" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={detailsForm.total_ht} 
                      onChange={handleDetailsChange} 
                      readOnly 
                      required 
                      aria-label="Total HT"
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', backgroundColor: '#f9fafb' }}
                    />
                  </div>
                
                {/* Show existing details for this contract */}
                {contractDetails[detailsModal] && contractDetails[detailsModal].length > 0 && (
                  <div className="details-table-container">
                    <h4>{t('existing_details')}</h4>
                    <div className="table-responsive" style={{ 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    width: '100%',
                    display: 'block',
                    overflowX: 'auto'
                  }}>
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>{t('description')}</th>
                            <th className="text-right">{t('qty')}</th>
                            <th className="text-right">{t('unit_price')}</th>
                            <th className="text-right">{t('tva_percent')}</th>
                            <th className="text-right">{t('total_ht')}</th>
                            <th className="text-right">{t('actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contractDetails[detailsModal].map((detail, index) => (
                            <tr key={detail.id || index}>
                              <td>{detail.description}</td>
                              <td className="text-right">{detail.qty}</td>
                              <td className="text-right">{parseFloat(detail.unit_price).toFixed(2)}</td>
                              <td className="text-right">{parseFloat(detail.tva).toFixed(2)}%</td>
                              <td className="text-right">{parseFloat(detail.total_ht).toFixed(2)}</td>
                              <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDetail(detail.id);
                                  }}
                                  className="action-btn"
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#f44336',
                                    cursor: 'pointer'
                                  }}
                                  title="Delete"
                                >
                                  <DeleteIcon fontSize="small" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setDetailsModal(null)}
                  style={{
                    background: 'white',
                    color: '#9c27b0',
                    border: '1px solid #9c27b0',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel')}
                </button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  disabled={loading}
                  onClick={(e) => handleDetailsSubmit(e, detailsModal)}
                  style={{
                    background: '#9c27b0',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? t('saving') + '...' : t('save_details')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input 
              type="text" 
              placeholder={t('search_contracts')} 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search contracts"
            />
          </div>
        </div>
        
        {/* Contracts Table */}
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>{t('command_number')}</th>
                <th>{t('client_name')}</th>
                <th>{t('price')}</th>
                <th>{t('deadline')}</th>
                <th>{t('contact_person')}</th>
                <th>{t('guarantee')}</th>
                <th className="text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((contract) => (
                <tr key={contract.id}>
                  <td>{contract.command_number}</td>
                  <td>{clients.find(c => c.value === contract.client_id)?.label || ''}</td>
                  <td className="text-right">{contract.price}</td>
                  <td>
                    {contract.deadline}
                    {isExpired(contract.deadline) && (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                        color: '#ef4444', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        marginLeft: '0.5rem'
                      }}>
                        <WarningIcon fontSize="inherit" style={{ marginRight: '0.25rem' }} />
                        Expired
                      </span>
                    )}
                  </td>
                  <td>{contract.contact_person}</td>
                  <td>
                    <span style={{ 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                      color: '#10b981', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem', 
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {contract.guarantee_percentage}%
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Tooltip title={t('view_pdf')}>
                        <button 
                          className="action-btn" 
                          onClick={() => handleViewPDF(contract, 'estimate')}
                          style={{ 
                            background: 'rgba(25, 118, 210, 0.1)', 
                            color: '#1976d2',
                            border: 'none',
                            borderRadius: '4px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </button>
                      </Tooltip>
                      <Tooltip title={t('download_invoice')}>
                        <button 
                          className="action-btn" 
                          onClick={() => handleDownloadPDF(contract, 'invoice')} 
                          disabled={loading}
                          style={{ 
                            background: 'rgba(25, 118, 210, 0.1)', 
                            color: '#1976d2',
                            border: 'none',
                            borderRadius: '4px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </button>
                      </Tooltip>
                      <Tooltip title={t('edit_contract')}>
                        <button 
                          className="action-btn" 
                          onClick={() => openEditModal(contract)}
                          style={{ 
                            background: 'rgba(76, 175, 80, 0.1)', 
                            color: '#4caf50',
                            border: 'none',
                            borderRadius: '4px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </button>
                      </Tooltip>
                      <Tooltip title={t('delete_contract')}>
                        <button 
                          className="action-btn" 
                          onClick={() => setModal({ show: true, contract })}
                          style={{ 
                            background: 'rgba(244, 67, 54, 0.1)', 
                            color: '#f44336',
                            border: 'none',
                            borderRadius: '4px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </Tooltip>
                      <Tooltip title={t('add_contract_details')}>
                        <button 
                          className="btn-primary" 
                          onClick={() => setDetailsModal(contract.id)} 
                          style={{ 
                            fontSize: '0.8rem', 
                            padding: '0.35rem 0.75rem',
                            background: '#9c27b0',
                            color: 'white',
                            borderRadius: '6px',
                            boxShadow: '0 2px 4px rgba(156, 39, 176, 0.25)',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <AddIcon fontSize="small" />
                          {t('add_details')}
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-light)' }}>
                    {t('no_contracts_found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="pagination-container">
          <button 
            className="pagination-btn" 
            onClick={() => setPage(page - 1)} 
            disabled={page === 1}
            aria-label="Previous page"
          >
            <NavigateBeforeIcon />
          </button>
          <span className="pagination-info">Page {page} of {totalPages || 1}</span>
          <button 
            className="pagination-btn" 
            onClick={() => setPage(page + 1)} 
            disabled={page === totalPages || totalPages === 0}
            aria-label="Next page"
          >
            <NavigateNextIcon />
          </button>
        </div>
        {/* Delete Modal */}
        {modal.show && (
          <div className="modal-overlay" onClick={() => setModal({ show: false, contract: null })}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{t('delete_contract')}</h3>
                <IconButton 
                  aria-label="close" 
                  onClick={() => setModal({ show: false, contract: null })}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </div>
              <div className="modal-body">
                <p>{t('delete_confirm')} <b>{modal.contract.command_number}</b>?</p>
                <p>{t('action_cannot_be_undone')}</p>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => setModal({ show: false, contract: null })}
                >
                  {t('cancel')}
                </button>
                <button 
                  className="btn-danger" 
                  onClick={handleDelete} 
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={16} style={{ color: 'white', marginRight: '0.5rem' }} /> : null}
                  {loading ? t('deleting') : t('delete')}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Modal */}
        {editModal.show && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              width: '90%',
              maxWidth: '600px',
              padding: '2rem',
              overflow: 'hidden'
            }}>
              <h3 style={{ 
                color: '#9c27b0', 
                fontSize: '1.5rem', 
                fontWeight: '600',
                marginTop: 0,
                marginBottom: '1.5rem',
                borderBottom: '2px solid #9c27b0',
                paddingBottom: '0.5rem',
                width: 'fit-content'
              }}>Edit Contract</h3>
                <div className="contracts-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="edit_command_number" style={{ color: '#9c27b0', fontWeight: '500', fontSize: '0.875rem' }}>Command Number</label>
                    <input 
                      id="edit_command_number" 
                      name="command_number" 
                      value={editForm.command_number} 
                      onChange={handleEditChange} 
                      required 
                      aria-label="Command Number"
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="edit_price" style={{ color: '#9c27b0', fontWeight: '500', fontSize: '0.875rem' }}>Price</label>
                    <input 
                      id="edit_price" 
                      name="price" 
                      type="number" 
                      value={editForm.price} 
                      onChange={handleEditChange} 
                      required 
                      aria-label="Price"
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="edit_date" style={{ color: '#9c27b0', fontWeight: '500', fontSize: '0.875rem' }}>Date</label>
                    <input 
                      id="edit_date" 
                      name="date" 
                      type="date" 
                      value={editForm.date} 
                      onChange={handleEditChange} 
                      required 
                      aria-label="Date"
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="edit_deadline" style={{ color: '#9c27b0', fontWeight: '500', fontSize: '0.875rem' }}>Deadline</label>
                    <input 
                      id="edit_deadline" 
                      name="deadline" 
                      type="date" 
                      value={editForm.deadline} 
                      onChange={handleEditChange} 
                      required 
                      aria-label="Deadline"
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="edit_guarantee_percentage" style={{ color: '#9c27b0', fontWeight: '500', fontSize: '0.875rem' }}>Guarantee Percentage</label>
                    <input 
                      id="edit_guarantee_percentage" 
                      name="guarantee_percentage" 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={editForm.guarantee_percentage} 
                      onChange={handleEditChange} 
                      required 
                      aria-label="Guarantee Percentage"
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="edit_contact_person" style={{ color: '#9c27b0', fontWeight: '500', fontSize: '0.875rem' }}>Contact Person</label>
                    <input 
                      id="edit_contact_person" 
                      name="contact_person" 
                      value={editForm.contact_person} 
                      onChange={handleEditChange} 
                      required 
                      aria-label="Contact Person"
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="edit_client_id" style={{ color: '#9c27b0', fontWeight: '500', fontSize: '0.875rem' }}>Client Name</label>
                    <select 
                      id="edit_client_id" 
                      name="client_id" 
                      value={editForm.client_id} 
                      onChange={handleEditChange} 
                      required 
                      aria-label="Client Name"
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', backgroundColor: 'white' }}
                    >
                      <option value="">{t('select_client')}</option>
                      {clients.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  {editError && <div style={{ color: 'red', marginTop: '1rem', gridColumn: 'span 2' }}>{editError}</div>}
                </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={closeEditModal}
                  style={{
                    background: 'white',
                    color: '#9c27b0',
                    border: '1px solid #9c27b0',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel')}
                </button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  disabled={loading}
                  onClick={handleEditSubmit}
                  style={{
                    background: '#9c27b0',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? t('saving') : t('save_changes')}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* PDF Modal */}
        {pdfModal.show && (
          <div className="modal-overlay" onClick={() => setPdfModal({ show: false, url: '', title: '' })}>
            <div className="modal-content pdf-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{pdfModal.title}</h3>
                <IconButton 
                  aria-label="close" 
                  onClick={() => setPdfModal({ show: false, url: '', title: '' })}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </div>
              <div className="modal-body pdf-container">
                {pdfModal.url ? (
                  <iframe 
                    src={pdfModal.url} 
                    className="pdf-iframe" 
                    title="PDF Preview"
                    aria-label="Contract PDF Document"
                  />
                ) : (
                  <div className="pdf-loading">
                    <CircularProgress size={40} />
                    <p>Loading PDF...</p>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => setPdfModal({ show: false, url: '', title: '' })}
                >
                  Close
                </button>
                <a 
                  href={pdfModal.url} 
                  download={`${pdfModal.title.replace(' ', '_')}.pdf`}
                  className="btn-primary" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GetAppIcon style={{ marginRight: '0.5rem' }} />
                  Download
                </a>
              </div>
            </div>
          </div>
        )}
        {/* Toast Notification */}
        {toast && (
          <div className={`toast-notification ${toast.includes('Error') || toast.includes('Failed') ? 'toast-error' : 'toast-success'}`}>
            {toast.includes('Error') || toast.includes('Failed') ? (
              <ErrorOutlineIcon className="toast-icon" />
            ) : (
              <CheckCircleOutlineIcon className="toast-icon" />
            )}
            <span>{toast}</span>
          </div>
        )}
      </Box>
    </Box>
  );
}

export default Contracts;
