import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import WarningIcon from '@mui/icons-material/Warning';
import { People, Description, AccountBalance, AttachMoney, MoreHoriz, Dashboard as DashboardIcon } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Box, CssBaseline, IconButton } from '@mui/material';
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

const Invoices = () => {
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
    if (!window.confirm('Delete this invoice?')) return;
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(120deg,#f4f6f8 60%,#e3e9f7 100%)' }}>
      {/* Unified Navbar */}
      <Navbar handleDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, px: { xs: 1, md: 4 }, mt: { xs: 7.5, md: 8 }, pb: 4, minHeight: '100vh', transition: 'all 0.3s', background: 'rgba(255,255,255,0.7)', boxShadow: { md: 3, xs: 0 } }}>
        <div className="invoices-summary-card">
          <div>
            <div className="summary-title">Total Invoices</div>
            <div className="summary-value">{filtered.length}</div>
          </div>
          <div>
            <div className="summary-title">Total Amount</div>
            <div className="summary-value">€{totalAmount.toLocaleString()}</div>
          </div>
          <div>
            <div className="summary-title">Total Paid</div>
            <div className="summary-value">€{totalPaid.toLocaleString()}</div>
          </div>
          <div>
            <div className="summary-title">Outstanding</div>
            <div className="summary-value outstanding">€{totalOutstanding.toLocaleString()}</div>
          </div>
        </div>
        <div className="invoices-table-card">
          <div className="table-header">
            <div className="table-title">Invoices</div>
            <div className="table-controls">
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="status-filter">
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
              <input type="text" className="search-bar" placeholder="Search invoice/client..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div className="invoices-table-container">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Client Name</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Balance</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>No invoices found.</td></tr>
                )}
                {paged.map(inv => {
                  const client = clients.find(c => c.id === inv.client_id);
                  const status = getStatus(inv.amount, inv.paid_amount || 0);
                  const overdue = isOverdue(inv.due_date, status);
                  return (
                    <tr key={inv.id} className={overdue ? 'overdue-row' : ''}>
                      <td>{inv.invoice_number}</td>
                      <td>{client ? client.full_name : ''}</td>
                      <td>€{inv.amount?.toLocaleString()}</td>
                      <td>€{(inv.paid_amount || 0).toLocaleString()}</td>
                      <td>€{((inv.amount || 0) - (inv.paid_amount || 0)).toLocaleString()}</td>
                      <td>{inv.due_date}</td>
                      <td>
                        <span className="status-badge" style={{ background: statusColors[status], color: '#fff' }}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        {overdue && <span className="overdue-badge"><WarningIcon style={{ fontSize: 16, marginRight: 2 }} />Overdue</span>}
                      </td>
                      <td>
                        <button className="icon-btn" title="View PDF" onClick={() => handleViewPDF(inv)}><VisibilityIcon /></button>
                        <button className="icon-btn" title="Download PDF" onClick={() => handleDownloadPDF(inv)}><DownloadIcon /></button>
                        <button className="icon-btn" title="Delete" onClick={() => handleDelete(inv)}><DeleteIcon /></button>
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
            <span>Page {page} of {totalPages || 1}</span>
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

export default Invoices;
