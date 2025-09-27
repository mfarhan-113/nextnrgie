import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Material UI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import { 
  CssBaseline, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  styled,
  alpha
} from '@mui/material';

// Material UI Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';

// Components
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// Styles to match Devis
import '../modern-contracts.css';
import '../toast.css';

// Styled Components
const ModalOverlay = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
});

const PdfPreviewContainer = styled('div')({
  width: '90%',
  height: '90%',
  background: 'white',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const PdfPreviewHeader = styled('div')({
  padding: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
  borderBottom: '1px solid #e0e0e0',
});

const PdfPreviewContent = styled('div')({
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
});

const LoadingPdf = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  color: '#666',
});

const ModernTableContainer = styled(TableContainer)({
  marginTop: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  borderRadius: '8px',
  overflow: 'hidden',
});

const StyledTable = styled(Table)({
  minWidth: '100%',
  borderCollapse: 'collapse',
});

const StyledTableHead = styled(TableHead)({
  '& th': {
    backgroundColor: '#f5f5f5',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#333',
    borderBottom: '2px solid #e0e0e0',
  },
});

const StyledTableRow = styled(TableRow)({
  '&:hover': {
    backgroundColor: '#f9f9f9',
  },
  '& td': {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
});

const ModernCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(156, 39, 176, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  },
  overflow: 'visible'
}));

const ActionButton = styled(Button)(({ variant = 'view' }) => ({
  minWidth: '44px',
  height: '44px',
  borderRadius: '12px',
  padding: '8px',
  transition: 'all 0.2s ease-in-out',
  ...(variant === 'view' && {
    backgroundColor: alpha('#9c27b0', 0.1),
    color: '#9c27b0',
    '&:hover': {
      backgroundColor: '#9c27b0',
      color: 'white',
      transform: 'scale(1.05)',
    }
  }),
  ...(variant === 'info' && {
    backgroundColor: alpha('#2196f3', 0.1),
    color: '#2196f3',
    '&:hover': {
      backgroundColor: '#2196f3',
      color: 'white',
      transform: 'scale(1.05)',
    }
  })
}));

const StatsCard = styled(Card)({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
});

function Factures() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [editFactureOpen, setEditFactureOpen] = useState(false);
  const [editingFacture, setEditingFacture] = useState(null);
  const [editForm, setEditForm] = useState({
    description: '',
    qty: '',
    unit_price: '',
    tva: '',
    total_ht: ''
  });
  
  // State for facture form
  const [showFactureForm, setShowFactureForm] = useState(false);
  const [factureForm, setFactureForm] = useState({
    description: '',
    qty: '',
    unit_price: '',
    tva: '',
    total_ht: ''
  });
  const [selectedContractId, setSelectedContractId] = useState('');
  const [contractFactures, setContractFactures] = useState([]);

  // Generate PDF for a contract - SUPER SIMPLE VERSION
  const generatePdf = async (contract) => {
    if (!contract || !contract.id) {
      alert('❌ No contract selected');
      return;
    }
    
    setLoadingPdf(true);
    setError('');
    
    console.log('🔥 Opening PDF for contract:', contract.id);
    
    // Just open the URL directly - no complex logic
    const pdfUrl = `${process.env.REACT_APP_API_URL}/pdf/facture/${contract.id}`;
    console.log('🔗 PDF URL:', pdfUrl);
    
    // Open PDF in new tab
    window.open(pdfUrl, '_blank');
    
    setLoadingPdf(false);
    setSuccess('✅ PDF opened in new tab!');
  };

  // Fetch factures for selected contract
  const fetchContractFactures = async (contractId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/factures/contract/${contractId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setContractFactures(response.data || []);
    } catch (error) {
      console.warn('Could not fetch contract factures:', error);
      setContractFactures([]);
    }
  };

  // Handle contract selection change
  const handleContractChange = (e) => {
    const contractId = e.target.value;
    setSelectedContractId(contractId);
    if (contractId) {
      fetchContractFactures(contractId);
    } else {
      setContractFactures([]);
    }
  };

  // Calculate remaining contract amount
  const getRemainingAmount = () => {
    if (!selectedContractId) return 0;
    const selectedContract = contracts.find(c => c.id === parseInt(selectedContractId));
    if (!selectedContract) return 0;
    
    const contractPrice = parseFloat(selectedContract.price) || 0;
    const invoicedAmount = contractFactures.reduce((sum, f) => sum + (parseFloat(f.total_ht) || 0), 0);
    return contractPrice - invoicedAmount;
  };

  // Check if current facture amount exceeds remaining
  const isAmountValid = () => {
    const currentAmount = parseFloat(factureForm.total_ht) || 0;
    const remaining = getRemainingAmount();
    return currentAmount <= remaining;
  };

  // Handle facture form input changes
  const handleFactureChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...factureForm, [name]: value };
    
    // Auto-calculate total_ht when qty or unit_price changes
    if (name === 'qty' || name === 'unit_price') {
      const qty = name === 'qty' ? parseFloat(value) || 0 : parseFloat(factureForm.qty) || 0;
      const unitPrice = name === 'unit_price' ? parseFloat(value) || 0 : parseFloat(factureForm.unit_price) || 0;
      updatedForm.total_ht = (qty * unitPrice).toFixed(2);
    }
    
    setFactureForm(updatedForm);
  };

  // Update contract price
  const updateContractPrice = async (contractId, amount) => {
    try {
      // First, get the current contract data
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/contracts/${contractId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const currentContract = response.data;
      
      // Update only the price field
      await axios.put(
        `${process.env.REACT_APP_API_URL}/contracts/${contractId}`,
        { 
          ...currentContract, // Include all current fields
          price: amount       // Update just the price
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Error updating contract price:', error);
      console.error('Error details:', error.response?.data);
      return false;
    }
  };

  // Handle facture form submission
  const handleFactureSubmit = async (e) => {
    e.preventDefault();
    if (!selectedContractId) {
      setError('Please select a contract');
      return;
    }

    try {
      const totalHt = parseFloat(factureForm.total_ht) || 0;
      const selectedContract = contracts.find(c => c.id === parseInt(selectedContractId));
      
      if (!selectedContract) {
        setError('Selected contract not found');
        return;
      }

      // Calculate new contract price
      const currentPrice = parseFloat(selectedContract.price) || 0;
      const newPrice = Math.max(0, (currentPrice - totalHt).toFixed(2));

      // First, update the contract price
      const updated = await updateContractPrice(selectedContractId, newPrice);
      
      if (!updated) {
        setError('Failed to update contract price');
        return;
      }
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/factures`,
        {
          ...factureForm,
          contract_id: parseInt(selectedContractId),
          qty: parseFloat(factureForm.qty) || 0,
          unit_price: parseFloat(factureForm.unit_price) || 0,
          tva: parseFloat(factureForm.tva) || 0,
          total_ht: parseFloat(factureForm.total_ht) || 0
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess('Facture added successfully!');
      setShowFactureForm(false);
      // Update local state to reflect the new price
      const updatedContracts = contracts.map(contract => 
        contract.id === parseInt(selectedContractId) 
          ? { ...contract, price: newPrice }
          : contract
      );
      setContracts(updatedContracts);

      // Reset form
      setFactureForm({
        description: '',
        qty: '',
        unit_price: '',
        tva: '',
        total_ht: ''
      });
      
      // Show success message
      setSuccess('Facture added and contract price updated successfully!');
      
      // Close the form after a short delay
      setTimeout(() => {
        setShowFactureForm(false);
        setSuccess('');
      }, 1500);
      
    } catch (error) {
      console.error('Error adding facture:', error);
      setError('Failed to add facture: ' + (error.response?.data?.message || error.message));
    }
  };

  // Open facture form
  const openFactureForm = () => {
    if (contracts.length === 0) {
      setError('No contracts available');
      return;
    }
    setShowFactureForm(true);
  };

  // Close PDF preview
  const closePreview = () => {
    setPreviewOpen(false);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
    }
  };

  // Show contract details (fetch contract details and factures)
  const showContractDetails = async (contract) => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch contract details (items that appear in PDF table)
      let details = [];
      let factures = [];
      
      try {
        const detailsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/contracts/${contract.id}/details`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        details = detailsResponse.data || [];
      } catch (detailsError) {
        console.warn('Could not fetch contract details:', detailsError);
        // Continue without details - they might not exist
      }
      
      try {
        const facturesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/factures/contract/${contract.id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        factures = facturesResponse.data || [];
      } catch (facturesError) {
        console.warn('Could not fetch factures:', facturesError);
        // Continue without factures - they might not exist
      }
      
      setSelectedContract({
        ...contract,
        details: details,
        factures: factures
      });
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching contract details:', error);
      setError(`Failed to load contract details: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Close contract details
  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedContract(null);
  };

  // Edit facture item
  const editFactureItem = (facture) => {
    setEditingFacture(facture);
    setEditForm({
      description: facture.description || '',
      qty: facture.qty || '',
      unit_price: facture.unit_price || '',
      tva: facture.tva || '',
      total_ht: facture.total_ht || ''
    });
    setEditFactureOpen(true);
  };

  // Handle edit form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...editForm, [name]: value };
    
    // Auto-calculate total_ht when qty or unit_price changes
    if (name === 'qty' || name === 'unit_price') {
      const qty = name === 'qty' ? parseFloat(value) || 0 : parseFloat(editForm.qty) || 0;
      const unitPrice = name === 'unit_price' ? parseFloat(value) || 0 : parseFloat(editForm.unit_price) || 0;
      updatedForm.total_ht = (qty * unitPrice).toFixed(2);
    }
    
    setEditForm(updatedForm);
  };

  // Save edited facture
  const saveEditedFacture = async (e) => {
    e.preventDefault();
    if (!editingFacture) return;

    try {
      setLoading(true);
      setError('');
      
      const oldAmount = parseFloat(editingFacture.total_ht) || 0;
      const newAmount = parseFloat(editForm.total_ht) || 0;
      const amountDifference = newAmount - oldAmount;
      
      // Update facture
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/factures/${editingFacture.id}`,
        {
          description: editForm.description,
          qty: parseFloat(editForm.qty) || 0,
          unit_price: parseFloat(editForm.unit_price) || 0,
          tva: parseFloat(editForm.tva) || 0,
          total_ht: parseFloat(editForm.total_ht) || 0
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update contract price (subtract the difference since more/less is now invoiced)
      const contractToUpdate = contracts.find(c => c.id === selectedContract.id);
      if (contractToUpdate) {
        const newPrice = parseFloat(contractToUpdate.price) - amountDifference;
        
        await axios.put(
          `${process.env.REACT_APP_API_URL}/contracts/${selectedContract.id}`,
          { 
            ...contractToUpdate,
            price: newPrice.toFixed(2)
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Update local states
        setContracts(contracts.map(c => 
          c.id === selectedContract.id 
            ? { ...c, price: newPrice.toFixed(2) }
            : c
        ));
        
        // Update selected contract factures
        const updatedFactures = selectedContract.factures.map(f => 
          f.id === editingFacture.id 
            ? { ...f, ...editForm, qty: parseFloat(editForm.qty), unit_price: parseFloat(editForm.unit_price), tva: parseFloat(editForm.tva), total_ht: parseFloat(editForm.total_ht) }
            : f
        );
        
        setSelectedContract({
          ...selectedContract,
          factures: updatedFactures
        });
      }
      
      setSuccess('Facture updated successfully!');
      setEditFactureOpen(false);
      setEditingFacture(null);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error updating facture:', error);
      setError(`Failed to update facture: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditFactureOpen(false);
    setEditingFacture(null);
    setEditForm({
      description: '',
      qty: '',
      unit_price: '',
      tva: '',
      total_ht: ''
    });
  };

  // Delete facture item
  const deleteFactureItem = async (factureId) => {
    if (!window.confirm('Are you sure you want to delete this facture item?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/factures/${factureId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update the selected contract's factures
      if (selectedContract) {
        const updatedFactures = selectedContract.factures.filter(f => f.id !== factureId);
        setSelectedContract({
          ...selectedContract,
          factures: updatedFactures
        });
        
        // Also update the contract price (add back the deleted facture amount)
        const deletedFacture = selectedContract.factures.find(f => f.id === factureId);
        if (deletedFacture) {
          const contractToUpdate = contracts.find(c => c.id === selectedContract.id);
          if (contractToUpdate) {
            const newPrice = parseFloat(contractToUpdate.price) + parseFloat(deletedFacture.total_ht);
            
            // Update contract price in backend
            await axios.put(
              `${process.env.REACT_APP_API_URL}/contracts/${selectedContract.id}`,
              { 
                ...contractToUpdate,
                price: newPrice.toFixed(2)
              },
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            // Update local contracts state
            setContracts(contracts.map(c => 
              c.id === selectedContract.id 
                ? { ...c, price: newPrice.toFixed(2) }
                : c
            ));
          }
        }
      }
      
      setSuccess('Facture item deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error deleting facture:', error);
      setError(`Failed to delete facture: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch contracts on component mount
  useEffect(() => {
    fetchContracts();
  }, []);

  // Fetch all contracts
  const fetchContracts = async () => {
    try {
      setLoadingContracts(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/contracts/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setContracts(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setError('Failed to load contracts');
    } finally {
      setLoadingContracts(false);
    }
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
      <Navbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={() => setMobileOpen(false)} />
      
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h3" fontWeight={800} sx={{ 
              background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mr: 2
            }}>
              {t('factures')}
            </Typography>
            <Box sx={{ 
              width: 4, 
              height: 40, 
              background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
              borderRadius: 2 
            }} />
          </Box>
          
          {/* Add Invoice Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setShowFactureForm(true);
              setFactureForm({
                description: '',
                qty: '',
                unit_price: '',
                tva: '',
                total_ht: ''
              });
            }}
            sx={{
              background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(156, 39, 176, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8e24aa 0%, #5e35b1 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(156, 39, 176, 0.6)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {t('add_facture') || 'Add Invoice'}
          </Button>
        </Box>

        {/* Success/Error Messages */}
        {error && (
          <Fade in={true}>
            <Box sx={{ 
              mb: 3, 
              p: 2.5, 
              backgroundColor: alpha('#f44336', 0.1),
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#f44336', 0.2),
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box sx={{ 
                width: 4, 
                height: 40, 
                backgroundColor: '#f44336',
                borderRadius: 1,
                mr: 2
              }} />
              <Typography color="error" fontWeight={500}>{error}</Typography>
            </Box>
          </Fade>
        )}
        {success && (
          <Fade in={true}>
            <Box sx={{ 
              mb: 3, 
              p: 2.5, 
              backgroundColor: alpha('#4caf50', 0.1),
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#4caf50', 0.2),
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box sx={{ 
                width: 4, 
                height: 40, 
                backgroundColor: '#4caf50',
                borderRadius: 1,
                mr: 2
              }} />
              <Typography color="success.main" fontWeight={500}>{success}</Typography>
            </Box>
          </Fade>
        )}

        {/* Stats Overview */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} sx={{ color: '#333', mb: 3 }}>
            📊 {t('overview') || 'Aperçu'}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            <StatsCard>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {contracts.length}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {t('total_contracts') || 'Total Contrats'}
                </Typography>
              </CardContent>
            </StatsCard>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  €{contracts.reduce((sum, c) => sum + (parseFloat(c.price) || 0), 0).toFixed(0)}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {t('total_value') || 'Valeur Totale'}
                </Typography>
              </CardContent>
            </StatsCard>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {contracts.filter(c => parseFloat(c.price) > 0).length}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {t('active') || 'Actif'}
                </Typography>
              </CardContent>
            </StatsCard>
          </Box>
        </Box>

        {/* Contracts Grid */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} sx={{ color: '#333', mb: 3 }}>
            📋 {t('contracts') || 'Contrats'}
          </Typography>
          
          {loadingContracts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={40} sx={{ color: '#9c27b0' }} />
              <Typography sx={{ ml: 2, color: '#666' }}>{t('loading') || 'Chargement des contrats...'}</Typography>
            </Box>
          ) : (contracts || []).length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)' 
              }, 
              gap: 3 
            }}>
              {contracts.map((contract, index) => (
                <Fade in={true} timeout={300 + index * 100} key={contract.id}>
                  <ModernCard>
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#333', fontSize: '1.1rem' }}>
                          {contract.command_number || `Contract #${contract.id}`}
                        </Typography>
                        <Chip 
                          label={parseFloat(contract.price) > 0 ? 'Active' : 'Pending'} 
                          size="small"
                          sx={{ 
                            backgroundColor: parseFloat(contract.price) > 0 ? alpha('#4caf50', 0.1) : alpha('#ff9800', 0.1),
                            color: parseFloat(contract.price) > 0 ? '#4caf50' : '#ff9800',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {t('contract_value') || 'Valeur du Contrat'}
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#9c27b0' }}>
                          €{parseFloat(contract.price || 0).toFixed(2)}
                        </Typography>
                      </Box>

                      {contract.deadline && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {t('deadline') || 'Date Limite'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {new Date(contract.deadline).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('view_pdf') || 'View PDF'} arrow>
                          <ActionButton
                            variant="view"
                            onClick={() => generatePdf(contract)}
                            disabled={loadingPdf}
                          >
                            <VisibilityIcon fontSize="small" />
                          </ActionButton>
                        </Tooltip>
                        
                        <Tooltip title={t('contract_details') || 'Contract Details'} arrow>
                          <ActionButton
                            variant="info"
                            onClick={() => showContractDetails(contract)}
                          >
                            <InfoIcon fontSize="small" />
                          </ActionButton>
                        </Tooltip>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary">
                        ID: {contract.id}
                      </Typography>
                    </CardActions>
                  </ModernCard>
                </Fade>
              ))}
            </Box>
          ) : (
            <ModernCard sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  📄 No contracts found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create your first contract to get started
                </Typography>
              </CardContent>
            </ModernCard>
          )}
        </Box>

        {/* PDF Preview Modal */}
        {previewOpen && (
          <ModalOverlay>
            <PdfPreviewContainer>
              <PdfPreviewHeader>
                <Typography variant="h6">{t('contract_preview') || 'Aperçu du Contrat'}</Typography>
                <IconButton onClick={closePreview}>
                  <CloseIcon />
                </IconButton>
              </PdfPreviewHeader>
              <PdfPreviewContent>
                {loadingPdf ? (
                  <LoadingPdf>
                    <CircularProgress />
                    <p>{t('loading_pdf') || 'Chargement du PDF...'}</p>
                  </LoadingPdf>
                ) : (
                  <iframe 
                    src={pdfUrl} 
                    title={t('contract_pdf') || 'PDF du Contrat'} 
                    width="100%" 
                    height="100%"
                    style={{ border: 'none' }}
                  />
                )}
              </PdfPreviewContent>
            </PdfPreviewContainer>
          </ModalOverlay>
        )}

        {/* Contract Details Modal */}
        {detailsOpen && selectedContract && (
          <ModalOverlay>
            <PdfPreviewContainer style={{ width: '90%', height: '85%' }}>
              <PdfPreviewHeader>
                <Typography variant="h6">
                  {t('contract_details') || 'Détails du Contrat'} - {selectedContract.command_number || `${t('contract') || 'Contrat'} #${selectedContract.id}`}
                </Typography>
                <IconButton onClick={closeDetails}>
                  <CloseIcon />
                </IconButton>
              </PdfPreviewHeader>
              <PdfPreviewContent style={{ padding: '1.5rem', overflow: 'auto' }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>{t('loading_contract_details') || 'Chargement des détails du contrat...'}</Typography>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Contract Details Table */}
                    <div>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#9c27b0' }}>
                        {t('contract_items_pdf') || 'Articles du Contrat (comme affiché dans le PDF)'}
                      </Typography>
                      {selectedContract.details && selectedContract.details.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                          <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr>
                                <th>{t('description') || 'Description'}</th>
                                <th>{t('qty') || 'Qté'}</th>
                                <th>{t('unit_price') || 'Prix Unitaire'}</th>
                                <th>{t('tva_percent') || 'TVA (%)'}</th>
                                <th>{t('total_ht') || 'Total HT'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedContract.details.map((detail, index) => (
                                <tr key={index}>
                                  <td>{detail.description}</td>
                                  <td>{detail.qty}</td>
                                  <td>€{Number(detail.unit_price).toFixed(2)}</td>
                                  <td>{detail.tva || 0}%</td>
                                  <td>€{Number(detail.total_ht).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ 
                          backgroundColor: '#f5f5f5', 
                          padding: '2rem', 
                          borderRadius: '8px', 
                          textAlign: 'center',
                          color: '#666'
                        }}>
                          <Typography>{t('no_contract_details') || 'Aucun détail de contrat trouvé. Ce contrat utilise l\'entrée de service par défaut.'}</Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {t('default_service_entry') || 'Par défaut: "Services selon contrat"'} - {t('qty') || 'Qté'}: 1 - {t('price') || 'Prix'}: €{Number(selectedContract.price || 0).toFixed(2)}
                          </Typography>
                        </div>
                      )}
                    </div>

                    {/* Factures Table */}
                    <div>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#9c27b0' }}>
                        {t('factures_invoiced_items') || 'Factures (Articles Facturés)'}
                      </Typography>
                      {selectedContract.factures && selectedContract.factures.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                          <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr>
                                <th>{t('description') || 'Description'}</th>
                                <th>{t('qty') || 'Qté'}</th>
                                <th>{t('unit_price') || 'Prix Unitaire'}</th>
                                <th>{t('tva_percent') || 'TVA (%)'}</th>
                                <th>{t('total_ht') || 'Total HT'}</th>
                                <th>{t('date') || 'Date'}</th>
                                <th>{t('actions') || 'Actions'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedContract.factures.map((facture, index) => (
                                <tr key={facture.id || index}>
                                  <td>{facture.description}</td>
                                  <td>{facture.qty}</td>
                                  <td>€{Number(facture.unit_price).toFixed(2)}</td>
                                  <td>{facture.tva || 0}%</td>
                                  <td>€{Number(facture.total_ht).toFixed(2)}</td>
                                  <td>{facture.created_at ? new Date(facture.created_at).toLocaleDateString() : 'N/A'}</td>
                                  <td>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      <Tooltip title={t('edit_facture_item') || 'Modifier l\'Article de Facture'} arrow>
                                        <IconButton
                                          onClick={() => editFactureItem(facture)}
                                          disabled={loading}
                                          sx={{ 
                                            color: '#2196f3',
                                            '&:hover': { 
                                              backgroundColor: alpha('#2196f3', 0.1),
                                              transform: 'scale(1.1)' 
                                            },
                                            '&:disabled': {
                                              color: '#ccc'
                                            },
                                            transition: 'all 0.2s ease-in-out'
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title={t('delete_facture_item') || 'Supprimer l\'Article de Facture'} arrow>
                                        <IconButton
                                          onClick={() => deleteFactureItem(facture.id)}
                                          disabled={loading}
                                          sx={{ 
                                            color: '#f44336',
                                            '&:hover': { 
                                              backgroundColor: alpha('#f44336', 0.1),
                                              transform: 'scale(1.1)' 
                                            },
                                            '&:disabled': {
                                              color: '#ccc'
                                            },
                                            transition: 'all 0.2s ease-in-out'
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ 
                          backgroundColor: '#f5f5f5', 
                          padding: '2rem', 
                          borderRadius: '8px', 
                          textAlign: 'center',
                          color: '#666'
                        }}>
                          <Typography>No factures created for this contract yet.</Typography>
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                  </div>
                )}
              </PdfPreviewContent>
            </PdfPreviewContainer>
          </ModalOverlay>
        )}
      </Box>
      
      {/* Facture Form Modal (Devis-style) */}
      {showFactureForm && (
        <div className="modal-overlay" onClick={() => setShowFactureForm(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            width: '90vw', maxWidth: '700px', maxHeight: '90vh', padding: '1.5rem', overflow: 'auto', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{t('add_facture') || 'Add Facture'}</h3>
              <IconButton onClick={() => setShowFactureForm(false)} size="small"><CloseIcon /></IconButton>
            </div>
            <form onSubmit={handleFactureSubmit} className="contracts-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <select id="contract_id" value={selectedContractId} onChange={handleContractChange} required>
                    <option value="">{t('select_contract') || 'Select Contract'}</option>
                    {contracts.map(contract => (
                      <option key={contract.id} value={contract.id}>
                        {contract.command_number || `Contract #${contract.id}`} - €{Number(contract.price).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="contract_id">{t('contracts') || 'Contracts'}</label>
                </div>
                
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <textarea 
                    id="facture_description" 
                    name="description" 
                    value={factureForm.description} 
                    onChange={handleFactureChange} 
                    placeholder=" " 
                    required 
                    rows="3"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.shiftKey) {
                        // Allow Shift+Enter for new line
                        e.stopPropagation();
                      } else if (e.key === 'Enter' && !e.shiftKey) {
                        // Prevent regular Enter from submitting form
                        e.preventDefault();
                      }
                    }}
                    style={{
                      resize: 'vertical',
                      minHeight: '60px',
                      fontFamily: 'inherit',
                      fontSize: 'inherit'
                    }}
                  />
                  <label htmlFor="facture_description">{t('description')}</label>
                </div>
                <div className="form-group">
                  <input id="facture_qty" name="qty" type="number" min="0" value={factureForm.qty} onChange={handleFactureChange} placeholder=" " required />
                  <label htmlFor="facture_qty">{t('qty')}</label>
                </div>
                <div className="form-group">
                  <input id="facture_unit_price" name="unit_price" type="number" min="0" step="0.01" value={factureForm.unit_price} onChange={handleFactureChange} placeholder=" " required />
                  <label htmlFor="facture_unit_price">{t('unit_price')}</label>
                </div>
                <div className="form-group">
                  <input id="facture_tva" name="tva" type="number" min="0" step="0.01" value={factureForm.tva} onChange={handleFactureChange} placeholder=" " required />
                  <label htmlFor="facture_tva">{t('tva_percent')}</label>
                </div>
                <div className="form-group">
                  <input 
                    id="facture_total_ht" 
                    name="total_ht" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={factureForm.total_ht} 
                    onChange={handleFactureChange} 
                    placeholder=" " 
                    required 
                  />
                  <label htmlFor="facture_total_ht">{t('total_ht')}</label>
                </div>
              </div>
              <div className="form-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowFactureForm(false)} style={{ padding: '0.6rem 1rem' }}>{t('cancel') || 'Cancel'}</button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading} 
                  style={{ 
                    padding: '0.6rem 1rem', 
                    background: '#4caf50', 
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? (t('saving') || 'Saving...') : (t('save_facture') || 'Save Facture')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Facture Modal */}
      {editFactureOpen && editingFacture && (
        <ModalOverlay>
          <PdfPreviewContainer style={{ width: '600px', height: 'auto', maxHeight: '80vh' }}>
            <PdfPreviewHeader>
              <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                ✏️ Edit Facture Item
              </Typography>
              <IconButton onClick={cancelEdit}>
                <CloseIcon />
              </IconButton>
            </PdfPreviewHeader>
            <PdfPreviewContent style={{ padding: '2rem', overflow: 'auto' }}>
              <form onSubmit={saveEditedFacture} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Box sx={{ 
                  backgroundColor: '#e3f2fd', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  border: '1px solid #bbdefb',
                  mb: 2
                }}>
                  <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Editing: {editingFacture.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1976d2' }}>
                    Original Amount: €{Number(editingFacture.total_ht).toFixed(2)}
                  </Typography>
                </Box>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <textarea 
                      id="edit_description" 
                      name="description" 
                      value={editForm.description} 
                      onChange={handleEditFormChange} 
                      placeholder=" " 
                      required 
                      rows="3"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey) {
                          // Allow Shift+Enter for new line
                          e.stopPropagation();
                        } else if (e.key === 'Enter' && !e.shiftKey) {
                          // Prevent regular Enter from submitting form
                          e.preventDefault();
                        }
                      }}
                      style={{
                        resize: 'vertical',
                        minHeight: '60px',
                        fontFamily: 'inherit',
                        fontSize: 'inherit'
                      }}
                    />
                    <label htmlFor="edit_description">Description</label>
                  </div>
                  
                  <div className="form-group">
                    <input 
                      id="edit_qty" 
                      name="qty" 
                      type="number" 
                      min="0" 
                      value={editForm.qty} 
                      onChange={handleEditFormChange} 
                      placeholder=" " 
                      required 
                    />
                    <label htmlFor="edit_qty">Quantity</label>
                  </div>
                  
                  <div className="form-group">
                    <input 
                      id="edit_unit_price" 
                      name="unit_price" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={editForm.unit_price} 
                      onChange={handleEditFormChange} 
                      placeholder=" " 
                      required 
                    />
                    <label htmlFor="edit_unit_price">Unit Price (€)</label>
                  </div>
                  
                  <div className="form-group">
                    <input 
                      id="edit_tva" 
                      name="tva" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={editForm.tva} 
                      onChange={handleEditFormChange} 
                      placeholder=" " 
                      required 
                    />
                    <label htmlFor="edit_tva">TVA (%)</label>
                  </div>
                  
                  <div className="form-group">
                    <input 
                      id="edit_total_ht" 
                      name="total_ht" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={editForm.total_ht} 
                      onChange={handleEditFormChange} 
                      placeholder=" " 
                      required 
                    />
                    <label htmlFor="edit_total_ht">Total HT (€)</label>
                  </div>
                </div>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={cancelEdit}
                    sx={{ 
                      minWidth: '120px',
                      borderColor: '#666',
                      color: '#666',
                      '&:hover': {
                        borderColor: '#333',
                        backgroundColor: alpha('#666', 0.1)
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ 
                      minWidth: '120px',
                      backgroundColor: '#2196f3',
                      '&:hover': {
                        backgroundColor: '#1976d2'
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : (t('save_changes') || 'Enregistrer les Modifications')}
                  </Button>
                </Box>
              </form>
            </PdfPreviewContent>
          </PdfPreviewContainer>
        </ModalOverlay>
      )}
    </Box>
  );
}

export default Factures;
