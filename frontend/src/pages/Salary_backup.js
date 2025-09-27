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
  Grid, Fab, Snackbar, Alert, Avatar, FormControl, InputLabel
} from '@mui/material';

import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as AttachMoneyIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  ErrorOutline as ErrorOutlineIcon,
  Work as WorkIcon,
  BeachAccess as LeaveIcon
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

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  '& .MuiCardContent-root': {
    padding: theme.spacing(3),
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

const Salary = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Main data state
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('employee_name');
  const [order, setOrder] = useState('asc');
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ open: false, salaryId: null });
  const [editModal, setEditModal] = useState({ open: false, salary: null });
  const [addModal, setAddModal] = useState({ open: false });
  
  // Form states
  const [editForm, setEditForm] = useState({
    employee_name: '',
    working_days: '',
    leaves: '',
    salary_per_day: '',
    total_salary: ''
  });
  
  const [addForm, setAddForm] = useState({
    employee_name: '',
    working_days: '',
    leaves: '',
    salary_per_day: '',
    total_salary: ''
  });
  
  // UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  
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

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle change page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle change rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle add new salary
  const handleAddNew = () => {
    setAddForm({
      employee_name: '',
      working_days: '',
      leaves: '',
      salary_per_day: '',
      total_salary: ''
    });
    setAddModal({ open: true });
  };

  // Handle edit salary
  const handleEdit = (salary) => {
    setEditForm({
      employee_name: salary.employee_name || '',
      working_days: salary.working_days || '',
      leaves: salary.leaves || '',
      salary_per_day: salary.salary_per_day || '',
      total_salary: salary.total_salary || ''
    });
    setEditModal({ open: true, salary });
  };

  // Handle delete click
  const handleDeleteClick = (salaryId) => {
    setDeleteModal({ open: true, salaryId });
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


  // Filter and sort salaries
  const filteredSalaries = useMemo(() => {
    return salaries.filter(salary => {
      const matchesSearch = 
        salary.employee_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    }).sort((a, b) => {
      if (orderBy === 'employee_name') {
        return order === 'asc' 
          ? a.employee_name.localeCompare(b.employee_name)
          : b.employee_name.localeCompare(a.employee_name);
      } else if (orderBy === 'total_salary') {
        return order === 'asc' ? a.total_salary - b.total_salary : b.total_salary - a.total_salary;
      }
      return 0;
    });
  }, [salaries, searchTerm, orderBy, order]);

  // Pagination
  const paginatedSalaries = useMemo(() => {
    return filteredSalaries.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredSalaries, page, rowsPerPage]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Navbar />
      <Sidebar />
      
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10, backgroundColor: '#f8fafc' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            {t('salaries') || 'Salary Management'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('manage_salaries_description') || 'Manage employee salaries and track payments'}
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {salaries.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total Employees
                    </Typography>
                  </Box>
                  <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {salaries.reduce((sum, s) => sum + (parseInt(s.working_days) || 0), 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total Working Days
                    </Typography>
                  </Box>
                  <WorkIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {salaries.reduce((sum, s) => sum + (parseInt(s.leaves) || 0), 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total Leaves
                    </Typography>
                  </Box>
                  <LeaveIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      ${salaries.reduce((sum, s) => sum + (parseFloat(s.total_salary) || 0), 0).toFixed(0)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total Payroll
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Main Table */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          {/* Toolbar */}
          <Toolbar sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              variant="outlined"
              placeholder={t('search_employees') || 'Search employees...'}
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, backgroundColor: 'background.paper' }
              }}
              sx={{ minWidth: 300, maxWidth: 400 }}
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchSalaries}
                sx={{ borderRadius: 2 }}
              >
                {t('refresh') || 'Refresh'}
              </Button>
            </Box>
          </Toolbar>
          
          {/* Loading indicator */}
          {loading && <LinearProgress />}
          
          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <TableSortLabel
                      active={orderBy === 'employee_name'}
                      direction={orderBy === 'employee_name' ? order : 'asc'}
                      onClick={() => handleRequestSort('employee_name')}
                    >
                      {t('employee_name') || 'Employee Name'}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('working_days') || 'Working Days'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('leaves') || 'Leaves'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('salary_per_day') || 'Daily Rate'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    <TableSortLabel
                      active={orderBy === 'total_salary'}
                      direction={orderBy === 'total_salary' ? order : 'asc'}
                      onClick={() => handleRequestSort('total_salary')}
                    >
                      {t('total_salary') || 'Total Salary'}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">{t('actions') || 'Actions'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSalaries.length > 0 ? (
                  paginatedSalaries.map((salary) => (
                    <StyledTableRow key={salary.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {salary.employee_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <WorkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {salary.working_days}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <LeaveIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {salary.leaves}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                          <Typography variant="body2" color="success.main">
                            ${parseFloat(salary.salary_per_day).toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            ${parseFloat(salary.total_salary).toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" className="action-buttons" sx={{ opacity: 0.7, gap: 1 }}>
                          <Tooltip title="Edit Salary">
                            <ActionButton onClick={() => handleEdit(salary)} sx={{ color: 'primary.main' }}>
                              <EditIcon fontSize="small" />
                            </ActionButton>
                          </Tooltip>
                          <Tooltip title="Delete Salary">
                            <ActionButton onClick={() => handleDeleteClick(salary.id)} sx={{ color: 'error.main' }}>
                              <DeleteIcon fontSize="small" />
                            </ActionButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {t('no_salaries_found') || 'No salaries found'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {searchTerm
                          ? t('no_salaries_match_search') || 'No salaries match your search criteria.'
                          : t('no_salaries_available') || 'No salary records available. Add a new salary to get started.'}
                      </Typography>
                      {!searchTerm && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={handleAddNew}
                          sx={{ mt: 1 }}
                        >
                          {t('add_salary') || 'Add Salary'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredSalaries.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              '& .MuiTablePagination-toolbar': {
                padding: 2,
              },
            }}
          />
        </Paper>

        {/* Floating Action Button */}
        <AddButton
          color="primary"
          aria-label="add salary"
          onClick={handleAddNew}
        >
          <AddIcon sx={{ fontSize: '28px' }} />
        </AddButton>
      </Box>
    </Box>
  );
};

export default Salary;
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
