import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Box, Typography, IconButton, Tooltip, CircularProgress, CssBaseline,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, TableSortLabel, TextField, InputAdornment,
  Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText, LinearProgress, Toolbar,
  useMediaQuery, useTheme, alpha, styled, Card, CardContent,
  Grid, Fab, Snackbar, Alert, Avatar
} from '@mui/material';

import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as AttachMoneyIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  ErrorOutline as ErrorOutlineIcon,
  Category as CategoryIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// Styled Components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    '& .action-buttons': {
      opacity: 1,
    },
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: 'scale(1.1)',
  },
}));

const AddButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
    transform: 'scale(1.1)',
  },
  zIndex: 1000,
}));

const Miscellaneous = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Main data state
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('description');
  const [order, setOrder] = useState('asc');
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ open: false, expenseId: null });
  const [editModal, setEditModal] = useState({ open: false, expense: null });
  const [addModal, setAddModal] = useState({ open: false });
  
  // Form states
  const [editForm, setEditForm] = useState({
    description: '',
    price: '',
    units: '',
    total: ''
  });
  
  const [addForm, setAddForm] = useState({
    description: '',
    price: '',
    units: '',
    total: ''
  });
  
  // UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: '', price: '', units: '', total: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ show: false, type: '', record: null });
  const [page, setPage] = useState(1);
  const [perPage] = useState(8);
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-GB');
    } catch (e) {
      console.error('Error formatting date:', e, 'Date string:', dateString);
      return 'N/A';
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/misc/`);
      console.log('API Response:', res.data); // Debug log
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses. Please try again.');
      setExpenses([]);
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let val = e.target.value;
    if (["price", "units"].includes(e.target.name)) {
      if (val === '' || isNaN(val) || Number(val) <= 0) val = '';
    }
    setForm(f => {
      const updated = { ...f, [e.target.name]: val };
      const price = parseFloat(updated.price || 0);
      const units = parseFloat(updated.units || 0);
      updated.total = price > 0 && units > 0 ? (price * units).toFixed(2) : '';
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.price || !form.units || Number(form.price) <= 0 || Number(form.units) <= 0) {
      setError('Please fill all fields with valid values.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/misc/`, form);
      // Expense added
      setForm({ description: '', price: '', units: '', total: '' });
      fetchExpenses();
    } catch (err) {
      console.error('Error adding expense:', err);
      const errorMsg = err.response?.data?.message || t('error_adding_expense');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Edit expense: populate form and set edit mode
  const handleEdit = (record) => {
    setModal({ show: true, type: 'edit', record });
    setForm({
      description: record.description || '',
      price: record.price || '',
      units: record.units || '',
      total: record.total || ''
    });
  };

  // Update expense: send PUT, reset state, refresh
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.description || !form.price || !form.units || Number(form.price) <= 0 || Number(form.units) <= 0) {
      setError('Please fill all fields with valid values.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/misc/${modal.record.id}`, {
        description: form.description,
        price: form.price,
        units: form.units,
        total: form.total
      });
      // Expense updated
      setModal({ show: false, type: '', record: null });
      setForm({ description: '', price: '', units: '', total: '' });
      fetchExpenses();
    } catch (err) {
      console.error('Error updating expense:', err);
      const errorMsg = err.response?.data?.message || t('error_updating_expense');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (record) => {
    if (!window.confirm(t('are_you_sure_delete'))) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/misc/${record.id}`);
      // Expense deleted
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
      const errorMsg = err.response?.data?.message || t('error_deleting_expense');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Filtering, sorting, pagination
  const filtered = expenses.filter(e => e.description.toLowerCase().includes(search.toLowerCase()));
  const sorted = filtered.sort((a, b) => {
    let valA = a[sortField], valB = b[sortField];
    if (sortField === 'date') { 
      valA = a.created_at ? new Date(a.created_at).getTime() : 0; 
      valB = b.created_at ? new Date(b.created_at).getTime() : 0; 
    }
    if (sortField === 'total') { 
      valA = parseFloat(a.price) * parseInt(a.units); 
      valB = parseFloat(b.price) * parseInt(b.units);
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const totalPages = Math.ceil(sorted.length / perPage);
  const paged = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };
  const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages) setPage(newPage); };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(120deg,#f4f6f8 60%,#e3e9f7 100%)' }}>
      <CssBaseline />
      {/* Unified Navbar */}
      <Navbar handleDrawerToggle={handleDrawerToggle} />
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, px: { xs: 1, md: 4 }, mt: { xs: 7.5, md: 8 }, pb: 4, minHeight: '100vh', transition: 'all 0.3s', background: 'rgba(255,255,255,0.7)', boxShadow: { md: 3, xs: 0 } }}>
        <h2 className="page-title">
          <AttachMoneyIcon sx={{ color: '#9c27b0' }} /> {t('miscellaneous_expenses')} <span>({expenses.length})</span>
        </h2>
        
        {/* Add/Edit Expense Form */}
        <div className="clients-card">
          <h3>{modal.type === 'edit' ? t('edit_expense') : t('add_new_expense')}</h3>
          <form className="clients-form" onSubmit={modal.type === 'edit' ? handleUpdate : handleSubmit} autoComplete="off">
            <div className="form-group">
              <input 
                id="description" 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                placeholder=" " 
                required 
              />
              <label htmlFor="description">{t('description')}</label>
            </div>
            <div className="form-group">
              <input 
                id="price" 
                name="price" 
                type="number" 
                value={form.price} 
                onChange={handleChange} 
                placeholder=" " 
                min="0" 
                step="0.01"
                required 
              />
              <label htmlFor="price">{t('price_per_unit')}</label>
            </div>
            <div className="form-group">
              <input 
                id="units" 
                name="units" 
                type="number" 
                value={form.units} 
                onChange={handleChange} 
                placeholder=" " 
                min="0" 
                required 
              />
              <label htmlFor="units">{t('units')}</label>
            </div>
            <div className="form-group">
              <input 
                id="total" 
                name="total" 
                type="text" 
                value={form.total ? `$${form.total}` : ''} 
                readOnly 
                tabIndex={-1} 
                placeholder=" " 
                className="readonly-input"
              />
              <label htmlFor="total">{t('total')}</label>
            </div>
            <div className="form-actions">
              <button type="submit" className="clients-btn" disabled={loading}>
                {loading ? t('saving') : (modal.type === 'edit' ? t('update_expense') : t('add_expense'))}
              </button>
              {modal.type === 'edit' && (
                <button type="button" className="clients-btn secondary" onClick={() => {
                  setModal({ show: false, type: '', record: null });
                  setForm({ description: '', price: '', units: '', total: '' });
                }}>{t('cancel')}</button>
              )}
            </div>
          </form>
          {error && <div className="text-error">{error}</div>}
        </div>

        {/* Search bar */}
        <Box sx={{ position: 'relative', mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ position: 'relative', width: { xs: '100%', sm: '300px' } }}>
            <SearchIcon sx={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'text.secondary', zIndex: 1 }} />
            <input 
              className="clients-search-input"
              type="text" 
              placeholder={t('search_by_description')} 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1); }} 
              style={{ 
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                fontSize: '1rem',
                background: 'var(--card-bg)',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.02)'
              }}
            />
          </Box>
        </Box>

        {/* Expense Table */}
        <div className="clients-table-container">
          <table className="clients-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('description')} className={sortField === 'description' ? `sort-${sortDir}` : ''}>{t('description')}</th>
                <th onClick={() => handleSort('price')} className={sortField === 'price' ? `sort-${sortDir}` : ''}>{t('price_per_unit')}</th>
                <th onClick={() => handleSort('units')} className={sortField === 'units' ? `sort-${sortDir}` : ''}>{t('units')}</th>
                <th onClick={() => handleSort('total')} className={sortField === 'total' ? `sort-${sortDir}` : ''}>{t('total')}</th>
                <th onClick={() => handleSort('date')} className={sortField === 'date' ? `sort-${sortDir}` : ''}>{t('date_added')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
                      <SearchIcon sx={{ fontSize: '2rem', opacity: 0.5, mb: 1 }} />
                      {t('no_expenses_found')}
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((e) => (
                  <tr key={e.id}>
                    <td>{e.description}</td>
                    <td>${parseFloat(e.price).toFixed(2)}</td>
                    <td>{e.units}</td>
                    <td>${(parseFloat(e.price) * parseInt(e.units)).toFixed(2)}</td>
                    <td>{formatDate(e.created_at)}</td>
                    <td className="actions">
                      <Tooltip title={t('edit_expense')}>
                        <button className="action-btn edit" onClick={() => handleEdit(e)}>
                          <EditIcon fontSize="small" />
                        </button>
                      </Tooltip>
                      <Tooltip title={t('delete_expense')}>
                        <button className="action-btn delete" onClick={() => {
                          if (window.confirm(t('are_you_sure_delete'))) {
                            handleDelete(e);
                          }
                        }}>
                          <DeleteIcon fontSize="small" />
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="clients-table-pagination">
          <button 
            className="pagination-btn" 
            onClick={() => handlePageChange(page - 1)} 
            disabled={page === 1}
          >
            <ChevronLeftIcon fontSize="small" />
          </button>
          <span className="pagination-info">{t('page')} {page} {t('of')} {totalPages || 1}</span>
          <button 
            className="pagination-btn" 
            onClick={() => handlePageChange(page + 1)} 
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronRightIcon fontSize="small" />
          </button>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </Box>
    </Box>
  );
};

export default Miscellaneous;
