import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Box, CssBaseline, IconButton, Tooltip } from '@mui/material';
import '../modern-salary.css';

const Salary = () => {
  const { t } = useTranslation();
  const [salaries, setSalaries] = useState([]);
  const [form, setForm] = useState({ 
    employee_name: '', 
    working_days: '', 
    leaves: '', 
    salary_per_day: '', 
    total_salary: '' 
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, salary: null });
  const [editModal, setEditModal] = useState({ show: false, salary: null });
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/salaries/`);
      setSalaries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching salaries:', err);
      setToast({ show: true, message: 'Failed to load salaries.', type: 'error' });
      setTimeout(() => setToast({ ...toast, show: false }), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalaries(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (["working_days", "leaves", "salary_per_day"].includes(e.target.name)) {
      const wd = e.target.name === "working_days" ? e.target.value : form.working_days;
      const lv = e.target.name === "leaves" ? e.target.value : form.leaves;
      const spd = e.target.name === "salary_per_day" ? e.target.value : form.salary_per_day;
      const total = ((parseInt(wd || 0) - parseInt(lv || 0)) * parseFloat(spd || 0)) || 0;
      setForm(f => ({ ...f, total_salary: total }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editModal.salary) {
        await axios.put(`${process.env.REACT_APP_API_URL}/salaries/${editModal.salary.id}`, form);
        setToast({ show: true, message: 'Salary updated successfully!', type: 'success' });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/salaries/`, form);
        setToast({ show: true, message: 'Salary added successfully!', type: 'success' });
      }
      setForm({ employee_name: '', working_days: '', leaves: '', salary_per_day: '', total_salary: '' });
      setEditModal({ show: false, salary: null });
      fetchSalaries();
    } catch (error) {
      console.error('Error saving salary:', error);
      setToast({ 
        show: true, 
        message: error.response?.data?.detail || 'Error saving salary', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setToast({ ...toast, show: false }), 3000);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.salary) return;
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/salaries/${deleteModal.salary.id}`);
      setToast({ show: true, message: 'Salary deleted successfully!', type: 'success' });
      setDeleteModal({ show: false, salary: null });
      fetchSalaries();
    } catch (error) {
      console.error('Error deleting salary:', error);
      setToast({ 
        show: true, 
        message: error.response?.data?.detail || 'Error deleting salary', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setToast({ ...toast, show: false }), 3000);
    }
  };

  const handleEdit = (salary) => {
    setEditModal({ show: true, salary });
    setForm({
      employee_name: salary.employee_name,
      working_days: salary.working_days,
      leaves: salary.leaves,
      salary_per_day: salary.salary_per_day,
      total_salary: salary.total_salary
    });
  };

  const filteredSalaries = salaries.filter(salary => 
    salary.employee_name?.toLowerCase().includes(search.toLowerCase())
  );
  
  const perPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredSalaries.length / perPage);
  const paginatedSalaries = filteredSalaries.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
  
  const resetForm = () => {
    setForm({ employee_name: '', working_days: '', leaves: '', salary_per_day: '', total_salary: '' });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(120deg,#f4f6f8 60%,#e3e9f7 100%)' }}>
      <CssBaseline />
      {/* Unified Navbar */}
      <Navbar handleDrawerToggle={handleDrawerToggle} />
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      
      {/* Main Content */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        px: { xs: 1, md: 4 }, 
        mt: { xs: 7.5, md: 8 }, 
        pb: 4, 
        minHeight: '100vh', 
        transition: 'all 0.3s', 
        background: 'rgba(255,255,255,0.7)', 
        boxShadow: { md: 3, xs: 0 } 
      }}>
        {/* Page Title */}
        <h2 className="page-title">
          <AttachMoneyIcon sx={{ color: '#9c27b0' }} /> {t('salaries')} <span>({salaries.length})</span>
        </h2>
        
        {/* Add/Edit Salary Form */}
        <div className="salary-card">
          <h3>{editModal.salary ? t('edit_salary') : t('add_new_salary')}</h3>
          <form className="salary-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <input 
                id="employee_name" 
                name="employee_name" 
                value={form.employee_name} 
                onChange={handleChange} 
                placeholder=" " 
                required 
              />
              <label htmlFor="employee_name">{t('employee_name')}</label>
            </div>
            
            <div className="form-group">
              <input 
                id="working_days" 
                name="working_days" 
                type="number" 
                value={form.working_days} 
                onChange={handleChange} 
                placeholder=" " 
                min="0" 
                required 
              />
              <label htmlFor="working_days">{t('working_days')}</label>
            </div>
            
            <div className="form-group">
              <input 
                id="leaves" 
                name="leaves" 
                type="number" 
                value={form.leaves} 
                onChange={handleChange} 
                placeholder=" " 
                min="0" 
                required 
              />
              <label htmlFor="leaves">{t('leaves')}</label>
            </div>
            
            <div className="form-group">
              <input 
                id="salary_per_day" 
                name="salary_per_day" 
                type="number" 
                value={form.salary_per_day} 
                onChange={handleChange} 
                placeholder=" " 
                min="0" 
                step="0.01"
                required 
              />
              <label htmlFor="salary_per_day">{t('salary_per_day')}</label>
            </div>
            
            <div className="form-group">
              <input 
                id="total_salary" 
                name="total_salary" 
                type="number" 
                value={form.total_salary || ''} 
                readOnly 
                placeholder=" " 
                className="readonly-input"
              />
              <label htmlFor="total_salary">{t('total_salary')}</label>
            </div>
            
            <div className="form-actions" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              {editModal.salary && (
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => {
                    setEditModal({ show: false, salary: null });
                    resetForm();
                  }}
                  disabled={loading}
                >
                  {t('cancel')}
                </button>
              )}
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? t('saving') : editModal.salary ? t('update_salary') : t('add_salary')}
              </button>
            </div>
          </form>
        </div>
        
        {/* Search Bar */}
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder={t('search_by_employee')} 
            value={search} 
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }} 
          />
        </div>
        
        {/* Salary Table */}
        <div className="salary-table-container">
          <table className="salary-table">
            <thead>
              <tr>
                <th>{t('employee')}</th>
                <th>{t('working_days')}</th>
                <th>{t('leaves')}</th>
                <th>{t('salary_per_day')}</th>
                <th>{t('total_salary')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSalaries.length > 0 ? (
                paginatedSalaries.map((salary, index) => (
                  <tr key={salary.id || index}>
                    <td>{salary.employee_name}</td>
                    <td>{salary.working_days}</td>
                    <td>{salary.leaves}</td>
                    <td>${parseFloat(salary.salary_per_day).toFixed(2)}</td>
                    <td>${parseFloat(salary.total_salary).toFixed(2)}</td>
                    <td>
                      <div className="action-buttons">
                        <Tooltip title="Edit">
                          <button 
                            className="btn-icon" 
                            onClick={() => handleEdit(salary)}
                            disabled={loading}
                          >
                            <EditIcon fontSize="small" />
                          </button>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <button 
                            className="btn-icon" 
                            onClick={() => setDeleteModal({ show: true, salary })}
                            disabled={loading}
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    {t('no_salaries_found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-button" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                {t('previous')}
              </button>
              <span className="pagination-info">
                {t('page')} {currentPage} {t('of')} {totalPages}
              </span>
              <button 
                className="pagination-button" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
              >
                {t('next')}
              </button>
            </div>
          )}
        </div>
      </Box>
      
      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t('delete_salary')}</h3>
            <p>{t('delete_salary_confirm')} <strong>{deleteModal.salary?.employee_name}</strong>?</p>
            <div className="modal-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => setDeleteModal({ show: false, salary: null })}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </Box>
  );
};
export default Salary;
