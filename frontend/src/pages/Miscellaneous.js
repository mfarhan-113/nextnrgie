import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Box, Typography, IconButton, Tooltip, CircularProgress, CssBaseline,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, TableSortLabel, TextField, InputAdornment,
  Button, Dialog, DialogTitle, DialogContent,
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

  // Main data state
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

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
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/misc/`);
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setToast({
        open: true,
        message: 'Failed to load expenses',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Handle add new expense
  const handleAddNew = () => {
    setAddForm({
      description: '',
      price: '',
      units: '',
      total: ''
    });
    setAddModal({ open: true });
  };

  // Handle edit expense
  const handleEdit = (expense) => {
    setEditForm({
      description: expense.description || '',
      price: expense.price || '',
      units: expense.units || '',
      total: expense.total || ''
    });
    setEditModal({ open: true, expense });
  };

  // Handle delete click
  const handleDeleteClick = (expenseId) => {
    setDeleteModal({ open: true, expenseId });
  };

  // Handle form changes with auto-calculation
  const handleAddFormChange = (event) => {
    const { name, value } = event.target;
    let updatedForm = { ...addForm, [name]: value };
    
    // Auto-calculate total
    if (['price', 'units'].includes(name)) {
      const price = name === 'price' ? parseFloat(value) || 0 : parseFloat(addForm.price) || 0;
      const units = name === 'units' ? parseFloat(value) || 0 : parseFloat(addForm.units) || 0;
      const total = price * units;
      updatedForm.total = total > 0 ? total.toFixed(2) : '';
    }
    
    setAddForm(updatedForm);
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    let updatedForm = { ...editForm, [name]: value };
    
    // Auto-calculate total
    if (['price', 'units'].includes(name)) {
      const price = name === 'price' ? parseFloat(value) || 0 : parseFloat(editForm.price) || 0;
      const units = name === 'units' ? parseFloat(value) || 0 : parseFloat(editForm.units) || 0;
      const total = price * units;
      updatedForm.total = total > 0 ? total.toFixed(2) : '';
    }
    
    setEditForm(updatedForm);
  };

  // Handle add form submit
  const handleAddSubmit = async (event) => {
    event.preventDefault();
    
    // Basic validation
    if (!addForm.description || !addForm.price || !addForm.units) {
      setToast({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert form data to proper types for API
      const expenseData = {
        ...addForm,
        price: parseFloat(addForm.price) || 0,
        units: parseFloat(addForm.units) || 0,
        total: parseFloat(addForm.total) || 0,
      };
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/misc/`,
        expenseData
      );
      
      // Add the new expense to the local state
      setExpenses(prev => [...prev, response.data]);
      
      setToast({
        open: true,
        message: 'Expense added successfully',
        severity: 'success'
      });
      
      setAddModal({ open: false });
    } catch (err) {
      console.error('Error adding expense:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to add expense';
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
    
    if (!editModal.expense) return;
    
    // Basic validation
    if (!editForm.description || !editForm.price || !editForm.units) {
      setToast({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert form data to proper types for API
      const expenseData = {
        ...editForm,
        price: parseFloat(editForm.price) || 0,
        units: parseFloat(editForm.units) || 0,
        total: parseFloat(editForm.total) || 0,
      };
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/misc/${editModal.expense.id}`,
        expenseData
      );
      
      // Update the expense in the local state
      setExpenses(prev => 
        prev.map(expense => 
          expense.id === editModal.expense.id ? response.data : expense
        )
      );
      
      setToast({
        open: true,
        message: 'Expense updated successfully',
        severity: 'success'
      });
      
      setEditModal({ open: false, expense: null });
    } catch (err) {
      console.error('Error updating expense:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update expense';
      setToast({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete expense
  const handleDelete = async () => {
    if (!deleteModal.expenseId) return;
    
    try {
      setLoading(true);
      await axios.delete(`${process.env.REACT_APP_API_URL}/misc/${deleteModal.expenseId}`);
      
      setExpenses(expenses.filter(e => e.id !== deleteModal.expenseId));
      setToast({
        open: true,
        message: 'Expense deleted successfully',
        severity: 'success'
      });
      
      setDeleteModal({ open: false, expenseId: null });
    } catch (err) {
      console.error('Error deleting expense:', err);
      setToast({
        open: true,
        message: 'Failed to delete expense',
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

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = 
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    }).sort((a, b) => {
      if (orderBy === 'description') {
        return order === 'asc' 
          ? a.description.localeCompare(b.description)
          : b.description.localeCompare(a.description);
      } else if (orderBy === 'total') {
        const totalA = parseFloat(a.price) * parseFloat(a.units);
        const totalB = parseFloat(b.price) * parseFloat(b.units);
        return order === 'asc' ? totalA - totalB : totalB - totalA;
      }
      return 0;
    });
  }, [expenses, searchTerm, orderBy, order]);

  // Pagination
  const paginatedExpenses = useMemo(() => {
    return filteredExpenses.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredExpenses, page, rowsPerPage]);

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
            {t('miscellaneous_expenses') || 'Miscellaneous Expenses'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('manage_expenses_description') || 'Track and manage miscellaneous business expenses'}
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {expenses.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t('total_expenses') || 'Total Expenses'}
                    </Typography>
                  </Box>
                  <ReceiptIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {expenses.reduce((sum, e) => sum + (parseFloat(e.units) || 0), 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t('total_units') || 'Total Units'}
                    </Typography>
                  </Box>
                  <CategoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                      ${expenses.reduce((sum, e) => sum + (parseFloat(e.price) * parseFloat(e.units) || 0), 0).toFixed(0)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t('total_value') || 'Total Value'}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      ${expenses.length > 0 ? (expenses.reduce((sum, e) => sum + (parseFloat(e.price) * parseFloat(e.units) || 0), 0) / expenses.length).toFixed(0) : '0'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t('average_cost') || 'Average Cost'}
                    </Typography>
                  </Box>
                  <CalculateIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
              placeholder={t('search_expenses') || 'Search expenses...'}
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
                onClick={fetchExpenses}
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
                      active={orderBy === 'description'}
                      direction={orderBy === 'description' ? order : 'asc'}
                      onClick={() => handleRequestSort('description')}
                    >
                      {t('description') || 'Description'}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('price_per_unit') || 'Price per Unit'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('units') || 'Units'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    <TableSortLabel
                      active={orderBy === 'total'}
                      direction={orderBy === 'total' ? order : 'asc'}
                      onClick={() => handleRequestSort('total')}
                    >
                      {t('total') || 'Total'}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('date_added') || 'Date Added'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">{t('actions') || 'Actions'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedExpenses.length > 0 ? (
                  paginatedExpenses.map((expense) => (
                    <StyledTableRow key={expense.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                            <ReceiptIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {expense.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                          <Typography variant="body2" color="success.main">
                            ${parseFloat(expense.price).toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <CategoryIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {expense.units}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            ${(parseFloat(expense.price) * parseFloat(expense.units)).toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(expense.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" className="action-buttons" sx={{ opacity: 0.7, gap: 1 }}>
                          <Tooltip title="Edit Expense">
                            <ActionButton onClick={() => handleEdit(expense)} sx={{ color: 'primary.main' }}>
                              <EditIcon fontSize="small" />
                            </ActionButton>
                          </Tooltip>
                          <Tooltip title="Delete Expense">
                            <ActionButton onClick={() => handleDeleteClick(expense.id)} sx={{ color: 'error.main' }}>
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
                      <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {t('no_expenses_found') || 'No expenses found'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {searchTerm
                          ? t('no_expenses_match_search') || 'No expenses match your search criteria.'
                          : t('no_expenses_available') || 'No expense records available. Add a new expense to get started.'}
                      </Typography>
                      {!searchTerm && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={handleAddNew}
                          sx={{ mt: 1 }}
                        >
                          {t('add_expense') || 'Add Expense'}
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
            count={filteredExpenses.length}
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
          aria-label="add expense"
          onClick={handleAddNew}
        >
          <AddIcon sx={{ fontSize: '28px' }} />
        </AddButton>
        
        {/* Add Expense Modal */}
        <Dialog
          open={addModal.open}
          onClose={() => setAddModal({ open: false })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              {t('add_expense') || 'Add New Expense'}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleAddSubmit}>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label={t('description') || 'Description'}
                    value={addForm.description}
                    onChange={handleAddFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="price"
                    label={t('price_per_unit') || 'Price per Unit'}
                    type="number"
                    value={addForm.price}
                    onChange={handleAddFormChange}
                    fullWidth
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="units"
                    label={t('units') || 'Units'}
                    type="number"
                    value={addForm.units}
                    onChange={handleAddFormChange}
                    fullWidth
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="total"
                    label={t('total') || 'Total'}
                    type="number"
                    value={addForm.total}
                    fullWidth
                    disabled
                    helperText="Automatically calculated: Price × Units"
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

        {/* Edit Expense Modal */}
        <Dialog
          open={editModal.open}
          onClose={() => setEditModal({ open: false, expense: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              {t('edit_expense') || 'Edit Expense'}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleEditSubmit}>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label={t('description') || 'Description'}
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="price"
                    label={t('price_per_unit') || 'Price per Unit'}
                    type="number"
                    value={editForm.price}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="units"
                    label={t('units') || 'Units'}
                    type="number"
                    value={editForm.units}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="total"
                    label={t('total') || 'Total'}
                    type="number"
                    value={editForm.total}
                    fullWidth
                    disabled
                    helperText="Automatically calculated: Price × Units"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setEditModal({ open: false, expense: null })}
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
          onClose={() => setDeleteModal({ open: false, expenseId: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">
                {t('delete_expense') || 'Delete Expense'}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('confirm_delete_expense') || 'Are you sure you want to delete this expense record? This action cannot be undone.'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteModal({ open: false, expenseId: null })}
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

export default Miscellaneous;
