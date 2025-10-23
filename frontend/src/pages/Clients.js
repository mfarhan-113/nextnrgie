import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../config/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import '../modern-clients.css';
import { People } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  Box, 
  CssBaseline, 
  IconButton, 
  Tooltip, 
  Typography,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  Button,
  Grid,
  Chip,
  Fade,
  Paper,
  Avatar,
  Divider,
  Modal,
  CircularProgress
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// Styled Components
const StatsCard = styled(Card)({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
  },
});

const ClientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(156, 39, 176, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    borderColor: alpha('#9c27b0', 0.2),
  },
}));

const ActionButton = styled(IconButton)(({ variant = 'edit' }) => ({
  borderRadius: '12px',
  padding: '8px',
  transition: 'all 0.2s ease-in-out',
  ...(variant === 'edit' && {
    backgroundColor: alpha('#2196f3', 0.1),
    color: '#2196f3',
    '&:hover': {
      backgroundColor: '#2196f3',
      color: 'white',
      transform: 'scale(1.1)',
    }
  }),
  ...(variant === 'delete' && {
    backgroundColor: alpha('#f44336', 0.1),
    color: '#f44336',
    '&:hover': {
      backgroundColor: '#f44336',
      transform: 'scale(1.1)',
    }
  })
}));


const ModalContainer = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '600px',
  maxHeight: '90vh',
  overflow: 'auto',
  backgroundColor: 'white',
  borderRadius: '16px',
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
  padding: '24px',
  outline: 'none',
});

const Clients = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Function to open add client modal
  const openAddModal = () => {
    setForm({ 
      client_number: '', 
      email: '', 
      phone: '', 
      tva_number: '', 
      client_name: '', 
      tsa_number: '', 
      contact_person: '', 
      contact_person_phone: '', 
      contact_person_designation: '', 
      client_address: '' 
    });
    setError('');
    setModal({ show: true, client: null, type: 'add' });
  };

  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ 
    client_number: '', 
    email: '', 
    phone: '', 
    tva_number: '', 
    client_name: '', 
    tsa_number: '', 
    contact_person: '', 
    contact_person_phone: '', 
    contact_person_designation: '', 
    client_address: '' 
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState({ show: false, client: null, type: '' });
  const [editModal, setEditModal] = useState({ show: false, client: null });
  const [editForm, setEditForm] = useState({ 
    client_number: '', 
    email: '', 
    phone: '', 
    tva_number: '', 
    client_name: '', 
    tsa_number: '', 
    contact_person: '', 
    contact_person_phone: '', 
    contact_person_designation: '', 
    client_address: '' 
  });
  const [editError, setEditError] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(8);

  // Fetch clients
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('clients/');
      if (Array.isArray(res.data)) {
        setClients(res.data);
      } else {
        setClients([]);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(t('failed_to_load_clients') || 'Échec du chargement des clients.');
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
      await api.post('clients/', form);
      setToast(t('client_added_successfully') || 'Client ajouté avec succès !');
      setForm({ 
        client_number: '', 
        email: '', 
        phone: '', 
        tva_number: '', 
        client_name: '', 
        tsa_number: '', 
        contact_person: '', 
        contact_person_phone: '', 
        contact_person_designation: '', 
        client_address: '' 
      });
      fetchClients();
    } catch (err) {
      console.error('[CLIENT SAVE ERROR]', err, err.response);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError(t('error_saving_client') || 'Une erreur s\'est produite lors de l\'enregistrement du client.');
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
      tva_number: client.tva_number || '',
      tsa_number: client.tsa_number || '',
      contact_person: client.contact_person || '',
      contact_person_phone: client.contact_person_phone || '',
      contact_person_designation: client.contact_person_designation || '',
      client_address: client.client_address || ''
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
      await api.put(`clients/${parseInt(editModal.client.id, 10)}/`, payload);
      setToast(t('client_updated_successfully') || 'Client mis à jour avec succès !');
      closeEditModal();
      fetchClients();
    } catch (err) {
      console.error('[CLIENT EDIT ERROR]', err, err.response);
      if (err.response && err.response.data && err.response.data.detail) {
        setEditError(err.response.data.detail);
      } else {
        setEditError(t('error_updating_client') || "Une erreur s'est produite lors de la mise à jour du client.");
      }
    }
  };

  // Function to open delete confirmation modal
  const handleDeleteClick = (client) => {
    setModal({ show: true, client, type: 'delete' });
  };

  const handleDelete = async () => {
    if (!modal.client) return;
    setLoading(true);
    try {
      await api.delete(`clients/${parseInt(modal.client.id, 10)}/`);
      setToast(t('client_deleted_successfully') || 'Client supprimé avec succès');
      fetchClients();
      setModal({ show: false, client: null, type: '' });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError(t('failed_to_delete_client') || 'Échec de la suppression du client.');
      }
    } finally {
      setLoading(false);
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h3" fontWeight={800} sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mr: 2
            }}>
              Clients
            </Typography>
            <Box sx={{ 
              width: 4, 
              height: 40, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2 
            }} />
            <Chip 
              label={`${clients.length} Clients`}
              sx={{ 
                ml: 2,
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
          
          {/* Add Client Button */}
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={openAddModal}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {t('add_client') || 'Ajouter un Client'}
          </Button>
        </Box>

        {/* Stats Overview */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} sx={{ color: '#333', mb: 3 }}>
            📊 {t('overview') || 'Aperçu'}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Fade in={true} timeout={300}>
                <StatsCard>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <People sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                      {clients.length}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {t('total_clients') || 'Total Clients'}
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Fade>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Fade in={true} timeout={400}>
                <StatsCard sx={{ background: 'linear-gradient(135deg, #26c6da 0%, #00acc1 100%)' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <BusinessIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                      {clients.filter(c => c.tva_number).length}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {t('with_tva') || 'Avec TVA'}
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Fade>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Fade in={true} timeout={500}>
                <StatsCard sx={{ background: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                      {clients.filter(c => c.contact_person).length}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {t('with_contacts') || 'Avec Contacts'}
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Fade>
            </Grid>
          </Grid>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder={t('search_client_by_number') || 'Rechercher un client par numéro de client'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: '400px',
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
        </Box>
        {/* Clients Grid */}
        <Grid container spacing={3}>
          {paged.map((client, index) => (
            <Grid item xs={12} sm={6} lg={4} key={client.id}>
              <Fade in={true} timeout={300 + index * 50}>
                <ClientCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        mr: 2,
                        width: 48,
                        height: 48
                      }}>
                        {client.client_name ? client.client_name.charAt(0).toUpperCase() : client.client_number?.charAt(0) || 'C'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ color: '#333' }}>
                          {client.client_name || (t('unnamed_client') || 'Client Sans Nom')}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          #{client.client_number}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {client.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon sx={{ color: '#667eea', mr: 1, fontSize: '1.2rem' }} />
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {client.email}
                          </Typography>
                        </Box>
                      )}
                      
                      {client.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ color: '#667eea', mr: 1, fontSize: '1.2rem' }} />
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {client.phone}
                          </Typography>
                        </Box>
                      )}
                      
                      {client.client_address && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <LocationOnIcon sx={{ color: '#667eea', mr: 1, fontSize: '1.2rem', mt: 0.1 }} />
                          <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.4 }}>
                            {client.client_address}
                          </Typography>
                        </Box>
                      )}
                      
                      {client.contact_person && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ color: '#667eea', mr: 1, fontSize: '1.2rem' }} />
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {client.contact_person}
                            {client.contact_person_designation && ` - ${client.contact_person_designation}`}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {(client.tva_number || client.tsa_number) && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {client.tsa_number && (
                          <Chip 
                            label={`SIRET: ${client.tsa_number}`}
                            size="small"
                            sx={{ 
                              backgroundColor: alpha('#2196f3', 0.1),
                              color: '#2196f3',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                        {client.tva_number && (
                          <Chip 
                            label={`TVA: ${client.tva_number}`}
                            size="small"
                            sx={{ 
                              backgroundColor: alpha('#4caf50', 0.1),
                              color: '#4caf50',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ px: 3, pb: 3, display: 'flex', gap: 1 }}>
                    <Tooltip title={t('edit_client') || 'Modifier le Client'} arrow>
                      <ActionButton variant="edit" onClick={() => handleEdit(client)}>
                        <EditIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                    <Tooltip title={t('delete_client') || 'Supprimer le Client'} arrow>
                      <ActionButton variant="delete" onClick={() => handleDeleteClick(client)}>
                        <DeleteIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                  </CardActions>
                </ClientCard>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {filtered.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: alpha('#667eea', 0.05),
            borderRadius: '16px',
            border: '2px dashed',
            borderColor: alpha('#667eea', 0.2)
          }}>
            <People sx={{ fontSize: 64, color: alpha('#667eea', 0.3), mb: 2 }} />
            <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
              {t('no_clients_found') || 'Aucun client trouvé'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {search ? (t('try_adjusting_search') || 'Essayez d\'ajuster vos termes de recherche') : (t('add_first_client') || 'Ajoutez votre premier client pour commencer')}
            </Typography>
          </Box>
        )}
        {/* Modern Pagination */}
        {totalPages > 1 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            mt: 4, 
            gap: 2 
          }}>
            <Button
              variant="outlined"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              startIcon={<ChevronLeftIcon />}
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
              {t('page') || 'Page'} {page} {t('of') || 'de'} {totalPages}
            </Typography>
            <Button
              variant="outlined"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              endIcon={<ChevronRightIcon />}
              sx={{ borderRadius: '12px' }}
            >
              {t('next') || 'Suivant'}
            </Button>
          </Box>
        )}


        {/* Add/Edit Client Modal */}
        <Modal
          open={modal.show && modal.type === 'add'}
          onClose={() => setModal({ show: false, client: null, type: '' })}
          closeAfterTransition
        >
          <Fade in={modal.show}>
            <ModalContainer>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight={600} sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {modal.client && modal.client !== null ? (t('edit_client') || 'Modifier le Client') : (t('add_new_client') || 'Ajouter un Nouveau Client')}
                </Typography>
                <IconButton onClick={() => setModal({ show: false, client: null, type: '' })}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <form onSubmit={handleSubmit} autoComplete="off">
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('client_number') || 'Numéro de Client'}
                      name="client_number"
                      value={form.client_number}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('client_name') || 'Nom du Client'}
                      name="client_name"
                      value={form.client_name}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('email_address') || 'Adresse Email'}
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('phone_number') || 'Numéro de Téléphone'}
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('tva_number') || 'Numéro TVA'}
                      name="tva_number"
                      value={form.tva_number}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('siret_number') || 'Numéro SIRET'}
                      name="tsa_number"
                      value={form.tsa_number}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('contact_person') || 'Personne de Contact'}
                      name="contact_person"
                      value={form.contact_person}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('contact_person_phone') || 'Téléphone de la Personne de Contact'}
                      name="contact_person_phone"
                      value={form.contact_person_phone}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('contact_person_designation') || 'Désignation de la Personne de Contact'}
                      name="contact_person_designation"
                      value={form.contact_person_designation}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('client_address') || 'Adresse du Client'}
                      name="client_address"
                      value={form.client_address}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <LocationOnIcon sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                {error && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    backgroundColor: alpha('#f44336', 0.1),
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: alpha('#f44336', 0.2)
                  }}>
                    <Typography color="error" variant="body2">
                      {error}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setModal({ show: false, client: null, type: '' })}
                    sx={{ borderRadius: '12px', mr: 2 }}
                  >
                    {t('cancel') || 'Annuler'}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                    sx={{ 
                      borderRadius: '12px', 
                      px: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      }
                    }}
                  >
                    {loading ? (t('saving') || 'Enregistrement...') : (modal.client && modal.client !== null ? (t('update_client') || 'Mettre à jour le Client') : (t('add_client') || 'Ajouter un Client'))}
                  </Button>
                </Box>
              </form>
            </ModalContainer>
          </Fade>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={modal.show && modal.type === 'delete'}
          onClose={() => setModal({ show: false, client: null, type: '' })}
          closeAfterTransition
        >
          <Fade in={modal.show && modal.type === 'delete'}>
            <ModalContainer sx={{ maxWidth: '400px' }}>
              <Box sx={{ textAlign: 'center' }}>
                <ErrorOutlineIcon sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  {t('delete_client') || 'Supprimer le Client'}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  {t('confirm_delete_client_message') || 'Êtes-vous sûr de vouloir supprimer'} "{modal.client?.client_name || modal.client?.client_number}" ? 
                  {t('action_cannot_be_undone') || 'Cette action ne peut pas être annulée.'}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setModal({ show: false, client: null, type: '' })}
                    sx={{ borderRadius: '12px' }}
                  >
                    {t('cancel') || 'Annuler'}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                    disabled={loading}
                    sx={{ borderRadius: '12px' }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {loading ? (t('deleting') || 'Suppression...') : (t('delete') || 'Supprimer')}
                  </Button>
                </Box>
              </Box>
            </ModalContainer>
          </Fade>
        </Modal>

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
              <div className="form-group">
                <input 
                  id="edit_tsa_number" 
                  name="tsa_number" 
                  value={editForm.tsa_number} 
                  onChange={handleEditChange} 
                  placeholder=" " 
                />
                <label htmlFor="edit_tsa_number">{t('tsa_number') || 'Numéro TSA'}</label>
              </div>
              <div className="form-group">
                <input 
                  id="edit_contact_person" 
                  name="contact_person" 
                  value={editForm.contact_person} 
                  onChange={handleEditChange} 
                  placeholder=" " 
                />
                <label htmlFor="edit_contact_person">{t('contact_person') || 'Personne de Contact'}</label>
              </div>
              <div className="form-group">
                <input 
                  id="edit_contact_person_phone" 
                  name="contact_person_phone" 
                  value={editForm.contact_person_phone} 
                  onChange={handleEditChange} 
                  placeholder=" " 
                />
                <label htmlFor="edit_contact_person_phone">{t('contact_person_phone') || 'Téléphone de la Personne de Contact'}</label>
              </div>
              <div className="form-group">
                <input 
                  id="edit_contact_person_designation" 
                  name="contact_person_designation" 
                  value={editForm.contact_person_designation} 
                  onChange={handleEditChange} 
                  placeholder=" " 
                />
                <label htmlFor="edit_contact_person_designation">{t('contact_person_designation') || 'Désignation de la Personne de Contact'}</label>
              </div>
              <div className="form-group">
                <textarea 
                  id="edit_client_address" 
                  name="client_address" 
                  value={editForm.client_address} 
                  onChange={handleEditChange} 
                  placeholder=" " 
                  rows="3"
                />
                <label htmlFor="edit_client_address">{t('client_address') || 'Adresse du Client'}</label>
              </div>
              <div className="form-actions">
                <button type="submit" className="clients-btn" disabled={loading}>
                  {loading ? (t('saving') || 'Enregistrement...') : (t('save_changes') || 'Enregistrer les Modifications')}
                </button>
                <button type="button" className="clients-btn secondary" onClick={closeEditModal}>{t('cancel') || 'Annuler'}</button>
              </div>
            </form>
            {editError && <div className="text-error">{editError}</div>}
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast && <div className="clients-toast">{toast}</div>}
    </Box>
  );
}

export default Clients;
