import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import '../modern-clients.css';
import { People } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Box, CssBaseline, IconButton, Tooltip } from '@mui/material';


const Clients = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ client_number: '', email: '', phone: '', tva_number: '', client_name: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState({ show: false, client: null });
  const [editModal, setEditModal] = useState({ show: false, client: null });
  const [editForm, setEditForm] = useState({ client_number: '', email: '', phone: '', tva_number: '', client_name: '' });
  const [editError, setEditError] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(8);

  // Fetch clients
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/clients/`);
      if (Array.isArray(res.data)) {
        setClients(res.data);
      } else {
        setClients([]);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchClients(); }, []);

  // Form handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_number || !form.email || !form.phone) {
      setError(t('required_field'));
      return;
    }
    setLoading(true);
    try {
      console.log('[CLIENT FORM PAYLOAD]', form);
      await axios.post(`${process.env.REACT_APP_API_URL}/clients/`, form);
      setToast('Client added successfully!');
      setForm({ client_number: '', email: '', phone: '', tva_number: '', client_name: '' });
      fetchClients();
    } catch (err) {
      console.error('[CLIENT SAVE ERROR]', err, err.response);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('An error occurred while saving the client.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 2500);
    }
  };
  const handleEdit = (client) => {
    setEditModal({ show: true, client });
    setEditForm({
      id: client.id,
      client_number: client.client_number || '',
      client_name: client.client_name || '',
      email: client.email || '',
      phone: client.phone || '',
      tva_number: client.tva_number || ''
    });
    setEditError('');
  };

  const closeEditModal = () => {
    setEditModal({ show: false, client: null });
    setEditError('');
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.client_number || !editForm.email || !editForm.phone) {
      setEditError(t('required_field'));
      return;
    }
    setLoading(true);
    try {
      console.log('[CLIENT EDIT PAYLOAD]', editForm);
      const { id, ...payload } = editForm;
      await axios.put(`${process.env.REACT_APP_API_URL}/clients/${editModal.client.id}`, payload);
      setToast('Client updated successfully!');
      closeEditModal();
      fetchClients();
    } catch (err) {
      console.error('[CLIENT EDIT ERROR]', err, err.response);
      if (err.response && err.response.data && err.response.data.detail) {
        setEditError(err.response.data.detail);
      } else {
        setEditError('An error occurred while updating the client.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 2500);
    }
  };

  const handleDelete = async () => {
    if (!modal.client) return;
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/clients/${parseInt(modal.client.id, 10)}`);
      setToast('Client deleted.');
      fetchClients();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to delete client.');
      }
    } finally {
      setLoading(false);
      setModal({ show: false, client: null });
      setTimeout(() => setToast(''), 2500);
    }
  };

  // Pagination, search, filtered list
  const filtered = clients.filter(
    (c) => c.client_number?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

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
          <People sx={{ color: '#9c27b0' }} /> Clients <span>({clients.length})</span>
        </h2>
        {/* Add/Edit Client Form */}
        <div className="clients-card">
          <h3>{t('add_new_client')}</h3>
          <form className="clients-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <input 
                id="client_number" 
                name="client_number" 
                value={form.client_number} 
                onChange={handleChange} 
                placeholder=" " 
                required 
              />
              <label htmlFor="client_number">{t('client_number')}</label>
            </div>
            <div className="form-group">
              <input 
                id="client_name" 
                name="client_name" 
                value={form.client_name} 
                onChange={handleChange} 
                placeholder=" " 
              />
              <label htmlFor="client_name">{t('client_name')}</label>
            </div>
            <div className="form-group">
              <input 
                id="email" 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder=" " 
                required 
              />
              <label htmlFor="email">{t('email_address')}</label>
            </div>
            <div className="form-group">
              <input 
                id="phone" 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                placeholder=" " 
                required 
              />
              <label htmlFor="phone">{t('phone_number')}</label>
            </div>
            <div className="form-group">
              <input 
                id="tva_number" 
                name="tva_number" 
                value={form.tva_number} 
                onChange={handleChange} 
                placeholder=" " 
              />
              <label htmlFor="tva_number">{t('tva_number')}</label>
            </div>
            <div className="form-actions">
              <button type="submit" className="clients-btn" disabled={loading}>
                {loading ? t('saving') : <>
                  <PersonAddIcon fontSize="small" />
                  {t('add_client')}
                </>}
              </button>
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
              placeholder={t('search_placeholder')} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
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
        {/* Client Table */}
        <div className="clients-table-container">
          <table className="clients-table">
            <thead>
              <tr>
                <th>{t('client_number')}</th>
                <th>{t('client_name')}</th>
                <th>{t('email')}</th>
                <th>{t('phone')}</th>
                <th>{t('tva_number')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((client) => (
                <tr key={client.id}>
                  <td>{client.client_number}</td>
                  <td>{client.client_name || 'N/A'}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>{client.tva_number || '—'}</td>
                  <td className="actions">
                    <Tooltip title={t('edit_client')}>
                      <button className="action-btn edit" onClick={() => handleEdit(client)}>
                        <EditIcon fontSize="small" />
                      </button>
                    </Tooltip>
                    <Tooltip title={t('delete_client')}>
                      <button className="action-btn delete" onClick={() => setModal({ show: true, client })}>
                        <DeleteIcon fontSize="small" />
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
                      <SearchIcon sx={{ fontSize: '2rem', opacity: 0.5, mb: 1 }} />
                      {t('no_results')}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="clients-table-pagination">
          <button 
            className="pagination-btn" 
            onClick={() => setPage(page - 1)} 
            disabled={page === 1}
          >
            <ChevronLeftIcon fontSize="small" />
          </button>
          <span className="pagination-info">{t('page_of', { current: page, total: totalPages || 1 })}</span>
          <button 
            className="pagination-btn" 
            onClick={() => setPage(page + 1)} 
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronRightIcon fontSize="small" />
          </button>
        </div>
      </Box>
      {/* Edit Modal */}
      {editModal.show && (
        <div className="clients-modal" onClick={closeEditModal}>
          <div className="clients-modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t('edit_client')}</h3>
            <form className="clients-form" onSubmit={handleEditSubmit} autoComplete="off">
              <div className="form-group">
                <input 
                  id="edit_client_number" 
                  name="client_number" 
                  value={editForm.client_number} 
                  onChange={handleEditChange} 
                  placeholder=" " 
                  required 
                />
                <label htmlFor="edit_client_number">{t('client_number')}</label>
              </div>
              <div className="form-group">
                <input 
                  id="edit_client_name" 
                  name="client_name" 
                  value={editForm.client_name} 
                  onChange={handleEditChange} 
                  placeholder=" " 
                />
                <label htmlFor="edit_client_name">{t('client_name')}</label>
              </div>
              <div className="form-group">
                <input 
                  id="edit_email" 
                  name="email" 
                  type="email" 
                  value={editForm.email} 
                  onChange={handleEditChange} 
                  placeholder=" " 
                  required 
                />
                <label htmlFor="edit_email">{t('email_address')}</label>
              </div>
              <div className="form-group">
                <input 
                  id="edit_phone" 
                  name="phone" 
                  value={editForm.phone} 
                  onChange={handleEditChange} 
                  placeholder=" " 
                  required 
                />
                <label htmlFor="edit_phone">{t('phone_number')}</label>
              </div>
              <div className="form-group">
                <input 
                  id="edit_tva_number" 
                  name="tva_number" 
                  value={editForm.tva_number} 
                  onChange={handleEditChange} 
                  placeholder=" " 
                />
                <label htmlFor="edit_tva_number">{t('tva_number')}</label>
              </div>
              <div className="form-actions">
                <button type="submit" className="clients-btn" disabled={loading}>
                  {loading ? t('saving') : t('save_changes')}
                </button>
                <button type="button" className="clients-btn secondary" onClick={closeEditModal}>{t('cancel')}</button>
              </div>
            </form>
            {editError && <div className="text-error">{editError}</div>}
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {modal.show && (
        <div className="clients-modal" onClick={() => setModal({ show: false, client: null })}>
          <div className="clients-modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t('delete_client')}?</h3>
            <p>{t('confirm_delete')} <b>{modal.client.client_name || modal.client.client_number}</b>? {t('this_action_cannot_be_undone')}.</p>
            <div className="clients-modal-actions">
              <button className="clients-btn secondary" onClick={() => setModal({ show: false, client: null })}>{t('cancel')}</button>
              <button className="clients-btn danger" onClick={handleDelete} disabled={loading}>
                {loading ? t('deleting') : <>
                  <DeleteIcon fontSize="small" />
                  {t('delete')}
                </>}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast && <div className="clients-toast">{toast}</div>}
    </Box>
  );
}

export default Clients;
