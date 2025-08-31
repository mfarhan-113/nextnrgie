import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import WarningIcon from '@mui/icons-material/Warning';
import CheckIcon from '@mui/icons-material/Check';
import { People, Description, AccountBalance, AttachMoney, MoreHoriz, Dashboard as DashboardIcon } from '@mui/icons-material';
import { Select, MenuItem, FormControl, IconButton, Tooltip, Box, CssBaseline } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MenuIcon from '@mui/icons-material/Menu';
import '../invoices.css';


const statusColors = {
  paid: '#4caf50', // green
  partial: '#ffb300', // yellow
  unpaid: '#e53935', // red
};

function getStatus(amount, paid) {
  if (paid >= amount) return 'paid';
  if (paid > 0) return 'partial';
  return 'unpaid';
}

function isOverdue(dueDate, status) {
  return status !== 'paid' && new Date(dueDate) < new Date();
}

const Balance = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/invoices/`);
      setInvoices(res.data);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchClients = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/clients/`);
      setClients(res.data);
    } catch {
      setClients([]);
    }
  };

  // Filtering logic
  const filtered = invoices.filter(inv => {
    const client = clients.find(c => c.id === inv.client_id);
    const clientName = client ? client.full_name.toLowerCase() : '';
    const matchesSearch = inv.invoice_number.toLowerCase().includes(search.toLowerCase()) || clientName.includes(search.toLowerCase());
    const status = getStatus(inv.amount, inv.paid_amount || 0);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // Summary stats
  const totalAmount = filtered.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalPaid = filtered.reduce((sum, i) => sum + (i.paid_amount || 0), 0);
  const totalOutstanding = totalAmount - totalPaid;

  // Action handlers
  const handleViewPDF = (invoice) => {
    window.open(`${process.env.REACT_APP_API_URL}/pdf/invoice/${invoice.id}`, '_blank');
  };
  const handleDownloadPDF = (invoice) => {
    window.open(`${process.env.REACT_APP_API_URL}/pdf/invoice/${invoice.id}`, '_blank');
    setToast('PDF downloaded');
    setTimeout(() => setToast(''), 2000);
  };
  const handleDelete = async (invoice) => {
    if (!window.confirm(t('delete_confirm_invoice'))) return;
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/invoices/${invoice.id}`);
      setToast('Invoice deleted');
      fetchInvoices();
    } catch {
      setToast('Error deleting invoice');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 2000);
    }
  };

  const handleStatusChange = async (invoice, newStatus) => {
    const currentStatus = getStatus(invoice.amount, invoice.paid_amount || 0);
    const isOverdueInvoice = isOverdue(invoice.due_date, currentStatus);
    
    // Check if invoice is overdue
    if (isOverdueInvoice) {
      setToast('Cannot change status of overdue invoices');
      return;
    }
    
    // Check if already paid
    if (currentStatus === 'paid') {
      setToast('Paid invoices cannot be changed');
      return;
    }
    
    // Show confirmation dialog
    const statusMessages = {
      'paid': t('mark_as_paid_confirm'),
      'unpaid': t('mark_as_unpaid_confirm'),
      'partial': t('mark_as_partial_confirm')
    };
    
    const confirmText = `${t('are_you_sure')} ${statusMessages[newStatus]}?`;
    if (!window.confirm(confirmText)) {
      return; // User cancelled the operation
    }

    setLoading(true);
    try {
      // Calculate the new paid amount based on status
      let paidAmount = invoice.paid_amount || 0;
      if (newStatus === 'paid') {
        paidAmount = invoice.amount;
      } else if (newStatus === 'unpaid') {
        paidAmount = 0;
      } else if (newStatus === 'partial') {
        paidAmount = invoice.amount / 2; // Default to half for partial
      }

      // Make API call to update invoice
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/invoices/${invoice.id}`, 
        {
          status: newStatus,
          paid_amount: paidAmount
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update the local state with the new data
      setInvoices(prevInvoices => 
        prevInvoices.map(inv => 
          inv.id === invoice.id 
            ? { 
                ...inv, 
                status: newStatus, 
                paid_amount: paidAmount 
              } 
            : inv
        )
      );
      
      setToast(t(`successfully_updated_invoice_status_to_${newStatus}`));
    } catch (error) {
      console.error('Error updating invoice status:', error);
      const errorMessage = error.response?.data?.detail || t('failed_to_update_invoice_status');
      setToast(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 2000);
    }
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
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
        <div className="invoices-summary-card">
          <div>
            <div className="summary-title">{t('total_invoices')}</div>
            <div className="summary-value">{filtered.length}</div>
          </div>
          <div>
            <div className="summary-title">{t('total_amount')}</div>
            <div className="summary-value">${totalAmount.toLocaleString()}</div>
          </div>
          <div>
            <div className="summary-title">{t('total_paid')}</div>
            <div className="summary-value">${totalPaid.toLocaleString()}</div>
          </div>
          <div>
            <div className="summary-title">{t('outstanding')}</div>
            <div className="summary-value outstanding">${totalOutstanding.toLocaleString()}</div>
          </div>
        </div>
        <div className="invoices-table-card">
          <div className="table-header">
            <div className="table-title">{t('invoices')}</div>
            <div className="table-controls">
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="status-filter">
                <option value="all">{t('all_statuses')}</option>
                <option value="paid">{t('paid')}</option>
                <option value="partial">{t('partial')}</option>
                <option value="unpaid">{t('unpaid')}</option>
              </select>
              <input type="text" className="search-bar" placeholder={t('search_invoice_client')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div className="invoices-table-container">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>{t('invoice_number')}</th>
                  <th>{t('total_amount')}</th>
                  <th>{t('paid_amount')}</th>
                  <th>{t('balance')}</th>
                  <th>{t('due_date')}</th>
                  <th>{t('status')}</th>
                  
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>{t('no_invoices')}</td></tr>
                )}
                {paged.map(inv => {
                  const client = clients.find(c => c.id === inv.client_id);
                  const status = getStatus(inv.amount, inv.paid_amount || 0);
                  const overdue = isOverdue(inv.due_date, status);
                  return (
                    <tr key={inv.id} className={overdue ? 'overdue-row' : ''}>
                      <td>{inv.invoice_number}</td>
                      <td>${inv.amount?.toLocaleString()}</td>
                      <td>${(inv.paid_amount || 0).toLocaleString()}</td>
                      <td>${((inv.amount || 0) - (inv.paid_amount || 0)).toLocaleString()}</td>
                      <td>{inv.due_date}</td>
                      <td>
                        <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                          <Select
                            value={status}
                            onChange={(e) => handleStatusChange(inv, e.target.value)}
                            disabled={status === 'paid' || isOverdue(inv.due_date, status)}
                            sx={{
                              '& .MuiSelect-select': {
                                padding: '4px 24px 4px 8px',
                                borderRadius: '12px',
                                backgroundColor: statusColors[status] || statusColors.unpaid,
                                color: '#fff',
                                fontWeight: 500,
                                opacity: isOverdue(inv.due_date, status) ? 0.7 : 1,
                                '&:hover': {
                                  backgroundColor: isOverdue(inv.due_date, status) 
                                    ? statusColors[status] || statusColors.unpaid 
                                    : `${statusColors[status] || statusColors.unpaid}CC`,
                                  cursor: isOverdue(inv.due_date, status) ? 'not-allowed' : 'pointer'
                                },
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                              },
                              '& .MuiSelect-icon': {
                                color: isOverdue(inv.due_date, status) ? '#ffffff99' : '#fff',
                                cursor: isOverdue(inv.due_date, status) ? 'not-allowed' : 'pointer'
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    padding: '8px 16px',
                                    '&.Mui-selected': {
                                      backgroundColor: '#f5f5f5',
                                      '&:hover': {
                                        backgroundColor: '#f0f0f0',
                                      },
                                    },
                                    '&.Mui-disabled': {
                                      opacity: 0.5,
                                      cursor: 'not-allowed'
                                    }
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="unpaid" disabled={status === 'paid' || isOverdue(inv.due_date, status)}>
                              <span style={{ color: statusColors.unpaid, fontWeight: 500 }}>{t('unpaid')}</span>
                            </MenuItem>
                            <MenuItem value="partial" disabled={status === 'paid' || isOverdue(inv.due_date, status)}>
                              <span style={{ color: statusColors.partial, fontWeight: 500 }}>{t('partial')}</span>
                            </MenuItem>
                            <MenuItem value="paid" disabled={isOverdue(inv.due_date, status)}>
                              <span style={{ color: statusColors.paid, fontWeight: 500 }}>
                                {status === 'paid' ? <><CheckIcon sx={{ fontSize: 16, mr: 0.5 }} /> {t('paid')}</> : t('mark_as_paid')}
                              </span>
                            </MenuItem>
                          </Select>
                        </FormControl>
                        {overdue && <span className="overdue-badge"><WarningIcon style={{ fontSize: 16, marginRight: 2 }} />{t('overdue')}</span>}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="pagination-bar">
            <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>&lt;</button>
            <span>{t('page')} {page} {t('of')} {totalPages || 1}</span>
            <button disabled={page === totalPages || totalPages === 0} onClick={() => handlePageChange(page + 1)}>&gt;</button>
          </div>
        </div>
        {/* Toast */}
        {toast && <div className="invoices-toast">{toast}</div>}
        {/* Loading Spinner */}
        {loading && <div className="invoices-loading"><div className="spinner"></div></div>}
      </Box>
    </Box>
  );
};

export default Balance;
