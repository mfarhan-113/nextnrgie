import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import WarningIcon from '@mui/icons-material/Warning';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { 
  Select, 
  MenuItem, 
  FormControl, 
  IconButton, 
  Tooltip, 
  Box, 
  CssBaseline, 
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fade,
  LinearProgress,
  Button,
  Grid
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
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

// Derive status: always prefer backend status so it persists on refresh
function getStatus(amount, paid, backendStatus) {
  if (backendStatus) return backendStatus;
  const amt = Number(amount) || 0;
  const paidAmt = Number(paid) || 0;
  if (paidAmt >= amt) return 'paid';
  if (paidAmt > 0) return 'partial';
  return 'unpaid';
}

function isOverdue(dueDate, status) {
  return status !== 'paid' && new Date(dueDate) < new Date();
}

// Styled Components
const StatsCard = styled(Card)(({ theme, variant }) => ({
  background: variant === 'total' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : variant === 'paid'
    ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
    : variant === 'outstanding'
    ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
    : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
  color: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  },
}));

const ModernTableContainer = styled(TableContainer)({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
});

const StyledTableHead = styled(TableHead)({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '& .MuiTableCell-head': {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    padding: '16px',
  },
});

const StyledTableRow = styled(TableRow)(({ theme, isoverdue }) => ({
  backgroundColor: isoverdue === 'true' ? alpha('#f44336', 0.05) : 'white',
  borderLeft: isoverdue === 'true' ? '4px solid #f44336' : 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: isoverdue === 'true' ? alpha('#f44336', 0.1) : alpha('#667eea', 0.05),
    transform: 'scale(1.01)',
  },
  '& .MuiTableCell-root': {
    padding: '16px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },
}));

const StatusChip = styled(Chip)(({ status }) => ({
  backgroundColor: status === 'paid' ? '#4caf50' : status === 'partial' ? '#ff9800' : '#f44336',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: '12px',
  '& .MuiChip-icon': {
    color: 'white',
  },
}));

const ActionButton = styled(IconButton)(({ variant = 'view' }) => ({
  borderRadius: '12px',
  padding: '8px',
  transition: 'all 0.2s ease-in-out',
  ...(variant === 'view' && {
    backgroundColor: alpha('#2196f3', 0.1),
    color: '#2196f3',
    '&:hover': {
      backgroundColor: '#2196f3',
      color: 'white',
      transform: 'scale(1.1)',
    }
  }),
  ...(variant === 'download' && {
    backgroundColor: alpha('#4caf50', 0.1),
    color: '#4caf50',
    '&:hover': {
      backgroundColor: '#4caf50',
      color: 'white',
      transform: 'scale(1.1)',
    }
  }),
  ...(variant === 'delete' && {
    backgroundColor: alpha('#f44336', 0.1),
    color: '#f44336',
    '&:hover': {
      backgroundColor: '#f44336',
      color: 'white',
      transform: 'scale(1.1)',
    }
  })
}));

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

  // Filtering logic with null checks
  const filtered = invoices.filter(inv => {
    if (!inv) return false;
    
    // Safely get client name
    const client = clients.find(c => c && c.id === inv.client_id);
    const clientName = (client?.client_name || '').toLowerCase();
    
    // Safely get invoice number
    const invoiceNumber = (inv.invoice_number || '').toLowerCase();
    const searchTerm = (search || '').toLowerCase();
    
    const matchesSearch = invoiceNumber.includes(searchTerm) || 
                         clientName.includes(searchTerm);
    
    const status = getStatus(inv.amount || 0, inv.paid_amount || 0, inv.status);
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
    // No confirmation and no overdue restriction; user requested direct edit
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
      
      // Update local state; backend status will persist across refresh
      setInvoices(prevInvoices =>
        prevInvoices.map(inv =>
          inv.id === invoice.id
            ? { ...inv, status: newStatus, paid_amount: paidAmount }
            : inv
        )
      );
      setToast(t(`successfully_updated_invoice_status_to_${newStatus}`) || `Status updated to ${newStatus}`);
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
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(10px)',
      }
    }}>
      <CssBaseline />
      <Navbar handleDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      
      <Box component="main" sx={{ 
        flexGrow: 1, 
        px: { xs: 2, md: 4 }, 
        mt: { xs: 7.5, md: 8 }, 
        pb: 4, 
        minHeight: '100vh', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(20px)',
        borderRadius: { md: '24px 0 0 0' },
        boxShadow: { md: '0 0 40px rgba(0,0,0,0.1)', xs: 0 },
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" fontWeight={800} sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mr: 2
          }}>
{t('balance_overview') || 'Aperçu du Solde'}
          </Typography>
          <Box sx={{ 
            width: 4, 
            height: 40, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2 
          }} />
          <Chip 
            label={`${filtered.length} ${t('invoices') || 'Factures'}`}
            sx={{ 
              ml: 2,
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Fade in={true} timeout={300}>
              <StatsCard variant="total">
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <ReceiptIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    {filtered.length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {t('total_invoices') || 'Total Factures'}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Fade>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Fade in={true} timeout={400}>
              <StatsCard variant="amount">
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    €{totalAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {t('total_amount') || 'Montant Total'}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Fade>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Fade in={true} timeout={500}>
              <StatsCard variant="paid">
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    €{totalPaid.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {t('total_paid') || 'Total Payé'}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Fade>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Fade in={true} timeout={600}>
              <StatsCard variant="outstanding">
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <TrendingDownIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    €{totalOutstanding.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {t('outstanding') || 'En Attente'}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Fade>
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h5" fontWeight={600} sx={{ color: '#333' }}>
            📋 {t('invoice_management') || 'Gestion des Factures'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder={t('search_invoices') || 'Rechercher des factures...'}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: '250px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                startAdornment={<FilterListIcon sx={{ color: '#667eea', mr: 1 }} />}
                sx={{
                  borderRadius: '12px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  },
                }}
              >
                <MenuItem value="all">{t('all_status') || 'Tous les Statuts'}</MenuItem>
                <MenuItem value="paid">{t('paid') || 'Payé'}</MenuItem>
                <MenuItem value="partial">{t('partial') || 'Partiel'}</MenuItem>
                <MenuItem value="unpaid">{t('unpaid') || 'Non Payé'}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        {/* Modern Table */}
        <ModernTableContainer component={Paper}>
          {loading && <LinearProgress sx={{ borderRadius: '16px 16px 0 0' }} />}
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>{t('invoice_number') || 'Numéro de Facture'}</TableCell>
                <TableCell align="right">{t('total_amount') || 'Montant Total'}</TableCell>
                <TableCell align="right">{t('paid_amount') || 'Montant Payé'}</TableCell>
                <TableCell align="right">{t('balance') || 'Solde'}</TableCell>
                <TableCell>{t('due_date') || 'Date d\'Échéance'}</TableCell>
                <TableCell>{t('status') || 'Statut'}</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      {t('no_invoices_found') || 'Aucune facture trouvée'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {paged.map((inv, index) => {
                const client = clients.find(c => c.id === inv.client_id);
                const status = getStatus(inv.amount, inv.paid_amount || 0, inv.status);
                const derivedPaid = typeof inv.paid_amount === 'number' ? inv.paid_amount : (
                  status === 'paid' ? inv.amount : status === 'partial' ? (inv.amount / 2) : 0
                );
                const overdue = isOverdue(inv.due_date, status);
                const balance = (inv.amount || 0) - (derivedPaid || 0);
                
                return (
                  <Fade in={true} key={inv.id} timeout={300 + index * 50}>
                    <StyledTableRow isoverdue={overdue.toString()}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {inv.invoice_number}
                          </Typography>
                          {overdue && (
                            <Chip
                              icon={<WarningIcon />}
                              label={t('overdue') || 'En Retard'}
                              size="small"
                              color="error"
                              sx={{ ml: 1, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="primary">
                          €{inv.amount?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          €{(derivedPaid || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          color={balance > 0 ? 'error.main' : 'success.main'}
                        >
                          €{balance.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(inv.due_date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small">
                          <Select
                            value={status}
                            onChange={(e) => handleStatusChange(inv, e.target.value)}
                            sx={{ minWidth: 140, borderRadius: '12px' }}
                          >
                            <MenuItem value="unpaid">Unpaid</MenuItem>
                            <MenuItem value="partial">Partial</MenuItem>
                            <MenuItem value="paid">Paid</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </StyledTableRow>
                  </Fade>
                );
              })}
            </TableBody>
          </Table>
        </ModernTableContainer>

        {/* Modern Pagination */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          mt: 3, 
          gap: 2 
        }}>
          <Button
            variant="outlined"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
            sx={{ borderRadius: '12px' }}
          >
{t('previous') || 'Précédent'}
          </Button>
          <Typography variant="body2" sx={{ 
            px: 2, 
            py: 1, 
            backgroundColor: alpha('#667eea', 0.1),
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>
{t('page') || 'Page'} {page} {t('of') || 'de'} {totalPages || 1}
          </Typography>
          <Button
            variant="outlined"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => handlePageChange(page + 1)}
            sx={{ borderRadius: '12px' }}
          >
{t('next') || 'Suivant'}
          </Button>
        </Box>
        {/* Modern Toast */}
        {toast && (
          <Fade in={true}>
            <Box sx={{ 
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 9999,
              p: 2.5, 
              backgroundColor: '#4caf50',
              color: 'white',
              borderRadius: 2,
              boxShadow: '0 8px 30px rgba(76, 175, 80, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CheckIcon />
              <Typography fontWeight={500}>{toast}</Typography>
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default Balance;
