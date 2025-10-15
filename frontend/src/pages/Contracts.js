import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { format } from 'date-fns';

// Material UI Components
import {
  Box, Typography, IconButton, Tooltip, CircularProgress, CssBaseline,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, TableSortLabel, TextField, InputAdornment,
  Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText, LinearProgress, Toolbar,
  useMediaQuery, useTheme, alpha, styled, Card, CardContent,
  Grid, Fab, Snackbar, Alert, Avatar, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

// Material UI Icons
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorOutlineIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Components
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

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  textTransform: 'capitalize',
  ...(status === 'active' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  }),
  ...(status === 'expired' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  }),
  ...(status === 'pending' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  }),
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

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const Contracts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  // Main data state
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc');
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ open: false, contractId: null });
  const [detailsModal, setDetailsModal] = useState({ open: false, contract: null });
  const [editModal, setEditModal] = useState({ open: false, contract: null });
  const [addModal, setAddModal] = useState({ open: false });
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    command_number: '',
    name: '',
    price: '',
    date: '',
    deadline: '',
    guarantee_percentage: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    client_id: ''
  });

  // Add form state
  const [addForm, setAddForm] = useState({
    command_number: '',
    name: '',
    price: '',
    date: '',
    deadline: '',
    guarantee_percentage: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    client_id: ''
  });
  
  // UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Fetch contracts on component mount
  useEffect(() => {
    fetchContracts();
    fetchClients();
  }, []);

  // Fetch contracts from API
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/contracts/`);
      setContracts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError(t('failed_to_load_contracts') || 'Échec du chargement des contrats. Veuillez réessayer.');
      setToast({
        open: true,
        message: t('failed_to_load_contracts') || 'Échec du chargement des contrats',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_BASE}/clients/`);
      setClients(response.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
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

  // Filter and sort contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = 
        contract.command_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.client?.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    }).sort((a, b) => {
      if (orderBy === 'date') {
        return order === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (orderBy === 'price') {
        return order === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (orderBy === 'deadline') {
        return order === 'asc'
          ? new Date(a.deadline) - new Date(b.deadline)
          : new Date(b.deadline) - new Date(a.deadline);
      }
      return 0;
    });
  }, [contracts, searchTerm, orderBy, order]);

  // Pagination
  const paginatedContracts = useMemo(() => {
    return filteredContracts.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredContracts, page, rowsPerPage]);

  // Handle delete contract
  const handleDelete = async () => {
    if (!deleteModal.contractId) return;
    
    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/contracts/${deleteModal.contractId}`);
      
      setContracts(contracts.filter(c => c.id !== deleteModal.contractId));
      setToast({
        open: true,
        message: t('contract_deleted_successfully') || 'Contrat supprimé avec succès',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting contract:', err);
      setToast({
        open: true,
        message: t('failed_to_delete_contract') || 'Échec de la suppression du contrat',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setDeleteModal({ open: false, contractId: null });
    }
  };

  // Get contract status
  const getContractStatus = (contract) => {
    const today = new Date();
    const deadline = new Date(contract.deadline);
    const isExpired = deadline < today;
    
    if (isExpired) return 'expired';
    
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const isExpiringSoon = deadline <= weekFromNow;
    
    return isExpiringSoon ? 'pending' : 'active';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return t('not_available') || 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0) + ' €';
  };

  // Handle edit contract
  const handleEdit = (contract) => {
    setEditForm({
      command_number: contract.command_number || '',
      name: contract.name || '',
      price: contract.price || '',
      date: contract.date || '',
      deadline: contract.deadline || '',
      guarantee_percentage: contract.guarantee_percentage || '',
      contact_person: contract.contact_person || '',
      contact_phone: contract.contact_phone || '',
      contact_email: contract.contact_email || '',
      contact_address: contract.contact_address || '',
      client_id: contract.client_id || ''
    });
    setEditModal({ open: true, contract });
  };

  // Handle add new contract
  const handleAddNew = () => {
    // Reset form to empty values
    setAddForm({
      command_number: '',
      name: '',
      price: '',
      date: '',
      deadline: '',
      guarantee_percentage: '',
      contact_person: '',
      contact_phone: '',
      contact_email: '',
      contact_address: '',
      client_id: ''
    });
    setAddModal({ open: true });
  };

  // Handle delete click
  const handleDeleteClick = (contractId) => {
    setDeleteModal({ open: true, contractId });
  };

  // Handle edit form change
  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form submit
  const handleEditSubmit = async (event) => {
    event.preventDefault();
    
    if (!editModal.contract) return;
    
    try {
      setLoading(true);
      
      // Convert form data to proper types for API
      const contractData = {
        ...editForm,
        price: parseFloat(editForm.price) || 0,
        client_id: parseInt(editForm.client_id) || 0,
        guarantee_percentage: editForm.guarantee_percentage ? parseFloat(editForm.guarantee_percentage) : null,
      };
      
      const response = await axios.put(
        `${API_BASE}/contracts/${editModal.contract.id}`,
        contractData
      );
      
      // Update the contract in the local state
      setContracts(prev => 
        prev.map(contract => 
          contract.id === editModal.contract.id ? response.data : contract
        )
      );
      
      setToast({
        open: true,
        message: t('contract_updated_successfully') || 'Contrat mis à jour avec succès',
        severity: 'success'
      });
      
      setEditModal({ open: false, contract: null });
    } catch (err) {
      console.error('Error updating contract:', err);
      const errorMessage = err.response?.data?.detail || err.message || (t('failed_to_update_contract') || 'Échec de la mise à jour du contrat');
      setToast({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle add form change
  const handleAddFormChange = (event) => {
    const { name, value } = event.target;
    setAddForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add form submit
  const handleAddSubmit = async (event) => {
    event.preventDefault();
    
    // Basic validation
    if (!addForm.command_number || !addForm.price || !addForm.date || !addForm.deadline || !addForm.client_id) {
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
      const contractData = {
        ...addForm,
        price: parseFloat(addForm.price) || 0,
        client_id: parseInt(addForm.client_id) || 0,
        guarantee_percentage: addForm.guarantee_percentage ? parseFloat(addForm.guarantee_percentage) : null,
      };
      
      const response = await axios.post(
        `${API_BASE}/contracts/`,
        contractData
      );
      
      // Add the new contract to the local state
      setContracts(prev => [...prev, response.data]);
      
      setToast({
        open: true,
        message: t('contract_created_successfully') || 'Contrat créé avec succès',
        severity: 'success'
      });
      
      setAddModal({ open: false });
    } catch (err) {
      console.error('Error creating contract:', err);
      const errorMessage = err.response?.data?.detail || err.message || (t('failed_to_create_contract') || 'Échec de la création du contrat');
      setToast({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle close toast
  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />;
      case 'pending':
        return <WarningIcon fontSize="small" sx={{ mr: 1 }} />;
      case 'expired':
        return <ErrorOutlineIcon fontSize="small" sx={{ mr: 1 }} />;
      default:
        return null;
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => getContractStatus(c) === 'active').length;
    const expiredContracts = contracts.filter(c => getContractStatus(c) === 'expired').length;
    const totalValue = contracts.reduce((sum, c) => sum + (c.price || 0), 0);

    return {
      total: totalContracts,
      active: activeContracts,
      expired: expiredContracts,
      value: totalValue
    };
  }, [contracts]);

  // Table columns
  const columns = [
    { id: 'contract_number', label: t('contract_number') || 'Contract #', sortable: true },
    { id: 'client', label: t('client') || 'Client', sortable: false },
    { id: 'date', label: t('date') || 'Date', sortable: true },
    { id: 'deadline', label: t('deadline') || 'Deadline', sortable: true },
    { id: 'price', label: t('amount') || 'Amount', sortable: true, align: 'right' },
    { id: 'status', label: t('status') || 'Status', sortable: false, align: 'center' },
    { id: 'actions', label: t('actions') || 'Actions', align: 'right' },
  ];

  // Render the table content
  const renderTableContent = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              {t('loading_contracts') || 'Loading contracts...'}
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" color="error" gutterBottom>
              {t('error_loading_contracts') || 'Erreur lors du chargement des contrats'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchContracts}
            >
              {t('retry') || 'Réessayer'}
            </Button>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredContracts.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
            <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {t('no_contracts_found') || 'Aucun contrat trouvé'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {searchTerm
                ? t('no_contracts_match_search') || 'Aucun contrat ne correspond à vos critères de recherche.'
                : t('no_contracts_available') || 'Aucun contrat disponible. Créez un nouveau contrat pour commencer.'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                sx={{ mt: 1 }}
              >
                {t('new_contract') || 'Nouveau Contrat'}
              </Button>
            )}
          </TableCell>
        </TableRow>
      );
    }

    return paginatedContracts.map((contract) => {
      const status = getContractStatus(contract);
      
      return (
        <StyledTableRow key={contract.id} hover>
          <TableCell>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {contract.command_number}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {contract.name || (t('no_name') || 'Aucun nom')}
              </Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                <BusinessIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {contract.client?.client_name || (t('not_available') || 'N/A')}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {contract.contact_person || (t('no_contact') || 'Aucun contact')}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell>
            <Box display="flex" alignItems="center">
              <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              {formatDate(contract.date)}
            </Box>
          </TableCell>
          <TableCell>
            <Box display="flex" alignItems="center">
              <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2">
                  {formatDate(contract.deadline)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {status === 'expired' ? (t('expired') || 'Expiré') : status === 'pending' ? (t('expires_soon') || 'Expire bientôt') : (t('active') || 'Actif')}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell align="right">
            <Typography variant="body2" fontWeight={600} color="success.main">
              {formatCurrency(contract.price)}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <StatusChip 
              label={status} 
              status={status}
              size="small"
              icon={getStatusIcon(status)}
            />
          </TableCell>
          <TableCell align="right">
            <Box display="flex" justifyContent="flex-end" className="action-buttons" sx={{ opacity: 0.7, gap: 1 }}>
              <Tooltip title={t('edit_contract') || 'Modifier le Contrat'}>
                <ActionButton onClick={() => handleEdit(contract)} sx={{ color: 'primary.main' }}>
                  <EditIcon fontSize="small" />
                </ActionButton>
              </Tooltip>
              <Tooltip title={t('delete_contract') || 'Supprimer le Contrat'}>
                <ActionButton onClick={() => handleDeleteClick(contract.id)} sx={{ color: 'error.main' }}>
                  <DeleteIcon fontSize="small" />
                </ActionButton>
              </Tooltip>
            </Box>
          </TableCell>
        </StyledTableRow>
      );
    });
  };

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
            {t('contracts') || 'Contrats'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('manage_contracts_description') || 'Gérez et suivez tous vos contrats en un seul endroit'}
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
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t('total_contracts') || 'Total Contrats'}
                    </Typography>
                  </Box>
                  <DescriptionIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                      {stats.active}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t('active_contracts') || 'Contrats Actifs'}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                      {stats.expired}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t('expired_contracts') || 'Contrats Expirés'}
                    </Typography>
                  </Box>
                  <ErrorOutlineIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                      {formatCurrency(stats.value)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t('total_value') || 'Valeur Totale'}
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
              placeholder={t('search_contracts') || 'Rechercher des contrats...'}
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
                onClick={fetchContracts}
                sx={{ borderRadius: 2 }}
              >
                {t('refresh') || 'Actualiser'}
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
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{
                        fontWeight: 600,
                        backgroundColor: theme.palette.background.paper,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {column.sortable ? (
                        <TableSortLabel
                          active={orderBy === column.id}
                          direction={orderBy === column.id ? order : 'asc'}
                          onClick={() => handleRequestSort(column.id)}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {renderTableContent()}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredContracts.length}
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
          aria-label={t('add_contract') || 'ajouter un contrat'}
          onClick={handleAddNew}
        >
          <AddIcon sx={{ fontSize: '28px' }} />
        </AddButton>
        
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteModal.open}
          onClose={() => setDeleteModal({ ...deleteModal, open: false })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">
                {t('delete_contract') || 'Supprimer le Contrat'}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('confirm_delete_contract') || 'Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action ne peut pas être annulée.'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteModal({ ...deleteModal, open: false })}
              disabled={loading}
            >
              {t('cancel') || 'Annuler'}
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? (t('deleting') || 'Suppression...') : (t('delete') || 'Supprimer')}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Edit Contract Modal */}
        <Dialog
          open={editModal.open}
          onClose={() => setEditModal({ open: false, contract: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              {t('edit_contract') || 'Modifier le Contrat'}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleEditSubmit}>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="command_number"
                    label={t('command_number') || 'Numéro de Commande'}
                    value={editForm.command_number}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="name"
                    label={t('contract_name') || 'Nom du Contrat'}
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="price"
                    label={t('price') || 'Prix'}
                    type="number"
                    value={editForm.price}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="guarantee_percentage"
                    label={t('guarantee_percentage') || 'Garantie %'}
                    type="number"
                    value={editForm.guarantee_percentage}
                    onChange={handleEditFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('client') || 'Client'}</InputLabel>
                    <Select
                      name="client_id"
                      value={editForm.client_id}
                      onChange={handleEditFormChange}
                      label={t('client') || 'Client'}
                    >
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.client_name || client.client_number}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="date"
                    label={t('date') || 'Date'}
                    type="date"
                    value={editForm.date}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="deadline"
                    label={t('deadline') || 'Date Limite'}
                    type="date"
                    value={editForm.deadline}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="contact_person"
                    label={t('contact_person') || 'Personne de Contact'}
                    value={editForm.contact_person}
                    onChange={handleEditFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="contact_phone"
                    label={t('contact_phone') || 'Téléphone de Contact'}
                    value={editForm.contact_phone}
                    onChange={handleEditFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="contact_email"
                    label={t('contact_email') || 'Email de Contact'}
                    type="email"
                    value={editForm.contact_email}
                    onChange={handleEditFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="contact_address"
                    label={t('contact_address') || 'Adresse de Contact'}
                    value={editForm.contact_address}
                    onChange={handleEditFormChange}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setEditModal({ open: false, contract: null })}
                disabled={loading}
              >
                {t('cancel') || 'Annuler'}
              </Button>
              <Button 
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? (t('updating') || 'Mise à jour...') : (t('update') || 'Mettre à jour')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        
        {/* Add Contract Modal */}
        <Dialog
          open={addModal.open}
          onClose={() => setAddModal({ open: false })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              {t('add_contract') || 'Ajouter un Nouveau Contrat'}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleAddSubmit}>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="command_number"
                    label={t('command_number') || 'Command Number'}
                    value={addForm.command_number}
                    onChange={handleAddFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="name"
                    label={t('contract_name') || 'Contract Name'}
                    value={addForm.name}
                    onChange={handleAddFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="price"
                    label={t('price') || 'Price'}
                    type="number"
                    value={addForm.price}
                    onChange={handleAddFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="guarantee_percentage"
                    label={t('guarantee_percentage') || 'Guarantee %'}
                    type="number"
                    value={addForm.guarantee_percentage}
                    onChange={handleAddFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>{t('client') || 'Client'}</InputLabel>
                    <Select
                      name="client_id"
                      value={addForm.client_id}
                      onChange={handleAddFormChange}
                      label={t('client') || 'Client'}
                    >
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.client_name || client.client_number}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="date"
                    label={t('date') || 'Date'}
                    type="date"
                    value={addForm.date}
                    onChange={handleAddFormChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="deadline"
                    label={t('deadline') || 'Deadline'}
                    type="date"
                    value={addForm.deadline}
                    onChange={handleAddFormChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="contact_person"
                    label={t('contact_person') || 'Contact Person'}
                    value={addForm.contact_person}
                    onChange={handleAddFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="contact_phone"
                    label={t('contact_phone') || 'Contact Phone'}
                    value={addForm.contact_phone}
                    onChange={handleAddFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="contact_email"
                    label={t('contact_email') || 'Contact Email'}
                    type="email"
                    value={addForm.contact_email}
                    onChange={handleAddFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="contact_address"
                    label={t('contact_address') || 'Contact Address'}
                    value={addForm.contact_address}
                    onChange={handleAddFormChange}
                    fullWidth
                    multiline
                    rows={3}
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
                {loading ? t('creating') : t('create') || 'Create'}
              </Button>
            </DialogActions>
          </form>
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

export default Contracts;
