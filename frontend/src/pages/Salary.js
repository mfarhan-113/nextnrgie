import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { getApiUrl } from '../config/api';
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
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl('salaries/'));
      setSalaries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching salaries:', err);
      setToast({
        open: true,
        message: t('failed_to_load_salaries') || 'Échec du chargement des salaries',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchSalaries(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Open delete confirmation
  const handleDeleteClick = (salaryId) => {
    setDeleteModal({ open: true, salaryId });
  };

  // Handle form changes with auto-calculation
  const handleAddFormChange = (event) => {
    const { name, value } = event.target;
    let updatedForm = { ...addForm, [name]: value };
    
    // Auto-calculate total salary
    if (['working_days', 'leaves', 'salary_per_day'].includes(name)) {
      const workingDays = name === 'working_days' ? parseInt(value) || 0 : parseInt(addForm.working_days) || 0;
      const leaves = name === 'leaves' ? parseInt(value) || 0 : parseInt(addForm.leaves) || 0;
      const salaryPerDay = name === 'salary_per_day' ? parseFloat(value) || 0 : parseFloat(addForm.salary_per_day) || 0;
      const totalSalary = (workingDays - leaves) * salaryPerDay;
      updatedForm.total_salary = totalSalary.toFixed(2);
    }
    
    setAddForm(updatedForm);
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    let updatedForm = { ...editForm, [name]: value };
    
    // Auto-calculate total salary
    if (['working_days', 'leaves', 'salary_per_day'].includes(name)) {
      const workingDays = name === 'working_days' ? parseInt(value) || 0 : parseInt(editForm.working_days) || 0;
      const leaves = name === 'leaves' ? parseInt(value) || 0 : parseInt(editForm.leaves) || 0;
      const salaryPerDay = name === 'salary_per_day' ? parseFloat(value) || 0 : parseFloat(editForm.salary_per_day) || 0;
      const totalSalary = (workingDays - leaves) * salaryPerDay;
      updatedForm.total_salary = totalSalary.toFixed(2);
    }
    
    setEditForm(updatedForm);
  };

  // Handle add form submit
  const handleAddSubmit = async (event) => {
    event.preventDefault();
    
    // Basic validation
    if (!addForm.employee_name || !addForm.working_days || !addForm.salary_per_day) {
      setToast({
        open: true,
        message: t('please_fill_required_fields') || 'Veuillez remplir tous les champs obligatoires',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert form data to proper types for API
      const salaryData = {
        ...addForm,
        working_days: parseInt(addForm.working_days) || 0,
        leaves: parseInt(addForm.leaves) || 0,
        salary_per_day: parseFloat(addForm.salary_per_day) || 0,
        total_salary: parseFloat(addForm.total_salary) || 0,
      };
      
      const response = await axios.post(
        getApiUrl('salaries/'),
        salaryData
      );
      
      // Add the new salary to the local state
      setSalaries(prev => [...prev, response.data]);
      
      setToast({
        open: true,
        message: t('salary_added_successfully') || 'Salaire ajouté avec succès',
        severity: 'success'
      });
      
      setAddModal({ open: false });
    } catch (err) {
      console.error('Error adding salary:', err);
      const errorMessage = err.response?.data?.detail || err.message || (t('failed_to_add_salary') || 'Échec de l\'ajout du salaire');
      setToast({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit form submit
  const handleEditSubmit = async (event) => {
    event.preventDefault();
    
    if (!editModal.salary) return;
    
    // Basic validation
    if (!editForm.employee_name || !editForm.working_days || !editForm.salary_per_day) {
      setToast({
        open: true,
        message: t('please_fill_required_fields') || 'Veuillez remplir tous les champs obligatoires',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert form data to proper types for API
      const salaryData = {
        ...editForm,
        working_days: parseInt(editForm.working_days) || 0,
        leaves: parseInt(editForm.leaves) || 0,
        salary_per_day: parseFloat(editForm.salary_per_day) || 0,
        total_salary: parseFloat(editForm.total_salary) || 0,
      };
      
      const response = await axios.put(
        getApiUrl(`salaries/${editModal.salary.id}`),
        salaryData
      );
      
      // Update the salary in the local state
      setSalaries(prev => 
        prev.map(salary => 
          salary.id === editModal.salary.id ? response.data : salary
        )
      );
      
      setToast({
        open: true,
        message: t('salary_updated_successfully') || 'Salaire mis à jour avec succès',
        severity: 'success'
      });
      setEditModal({ open: false, salary: null });
    } catch (err) {
      console.error('Error updating salary:', err);
      const errorMessage = err.response?.data?.detail || err.message || (t('failed_to_update_salary') || 'Échec de la mise à jour du salaire');
      setToast({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.salaryId) return;
    try {
      setLoading(true);
      await axios.delete(getApiUrl(`salaries/${deleteModal.salaryId}`));
      setSalaries(salaries.filter(s => s.id !== deleteModal.salaryId));
      setToast({
        open: true,
        message: t('salary_deleted_successfully') || 'Salaire supprimé avec succès',
        severity: 'success'
      });
      setDeleteModal({ open: false, salaryId: null });
    } catch (err) {
      console.error('Error deleting salary:', err);
      setToast({
        open: true,
        message: t('failed_to_delete_salary') || 'Échec de la suppression du salaire',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle close toast
  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
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
            {t('salaries') || 'Gestion des Salaires'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('manage_salaries_description') || 'Gérez les salaires des employés et suivez les paiements'}
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
                      {t('total_employees') || 'Total Employés'}
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
                      {t('total_working_days') || 'Total Jours Travaillés'}
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
                      {t('total_leaves') || 'Total Congés'}
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
                      €{salaries.reduce((sum, s) => sum + (parseFloat(s.total_salary) || 0), 0).toFixed(0)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t('total_payroll') || 'Total Payroll'}
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
                        <Typography variant="body2" color="success.main">
                          €{parseFloat(salary.salary_per_day).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          €{parseFloat(salary.total_salary).toFixed(2)}
                        </Typography>
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
              borderTop: `1px solid {theme.palette.divider}`,
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
        
        {/* Add Salary Modal */}
        <Dialog
          open={addModal.open}
          onClose={() => setAddModal({ open: false })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              {t('add_salary') || 'Add New Salary'}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleAddSubmit}>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="employee_name"
                    label={t('employee_name') || 'Employee Name'}
                    value={addForm.employee_name}
                    onChange={handleAddFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="working_days"
                    label={t('working_days') || 'Working Days'}
                    type="number"
                    value={addForm.working_days}
                    onChange={handleAddFormChange}
                    fullWidth
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="leaves"
                    label={t('leaves') || 'Leaves'}
                    type="number"
                    value={addForm.leaves}
                    onChange={handleAddFormChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="salary_per_day"
                    label={t('salary_per_day') || 'Salary Per Day'}
                    type="number"
                    value={addForm.salary_per_day}
                    onChange={handleAddFormChange}
                    fullWidth
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="total_salary"
                    label={t('total_salary') || 'Total Salary'}
                    type="number"
                    value={addForm.total_salary}
                    fullWidth
                    disabled
                    helperText="Automatically calculated: (Working Days - Leaves) × Daily Rate"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setAddModal({ open: false })}
                disabled={loading}
              >
                {t('cancel') || 'Cancel'}
              </Button>
              <Button 
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? t('adding') : t('add') || 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Edit Salary Modal */}
        <Dialog
          open={editModal.open}
          onClose={() => setEditModal({ open: false, salary: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              {t('edit_salary') || 'Edit Salary'}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleEditSubmit}>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="employee_name"
                    label={t('employee_name') || 'Employee Name'}
                    value={editForm.employee_name}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="working_days"
                    label={t('working_days') || 'Working Days'}
                    type="number"
                    value={editForm.working_days}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="leaves"
                    label={t('leaves') || 'Leaves'}
                    type="number"
                    value={editForm.leaves}
                    onChange={handleEditFormChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="salary_per_day"
                    label={t('salary_per_day') || 'Salary Per Day'}
                    type="number"
                    value={editForm.salary_per_day}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="total_salary"
                    label={t('total_salary') || 'Total Salary'}
                    type="number"
                    value={editForm.total_salary}
                    fullWidth
                    disabled
                    helperText="Automatically calculated: (Working Days - Leaves) × Daily Rate"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setEditModal({ open: false, salary: null })}
                disabled={loading}
              >
                {t('cancel') || 'Cancel'}
              </Button>
              <Button 
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? t('updating') : t('update') || 'Update'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, salaryId: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">
                {t('delete_salary') || 'Delete Salary'}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('confirm_delete_salary') || 'Are you sure you want to delete this salary record? This action cannot be undone.'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteModal({ open: false, salaryId: null })}
              disabled={loading}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? t('deleting') : t('delete') || 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Toast Notification */}
        <Snackbar
          open={toast.open}
          autoHideDuration={6000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseToast} 
            severity={toast.severity}
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Salary;
