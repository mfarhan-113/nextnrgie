import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Divider, CircularProgress, Alert, FormControlLabel, Checkbox } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { loginWithEmailAndPassword } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);
  const [rememberMe, setRememberMe] = useState(true);
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email(t('invalid_email')).required(t('email_required')),
      password: Yup.string().min(6, t('password_min_length')).required(t('password_required')),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setAuthError(null);
      try {
        const { user, error } = await loginWithEmailAndPassword(
          values.email, 
          values.password,
          rememberMe // Pass the remember me preference
        );
        
        if (error) {
          setAuthError(t(error) || error);
        } else if (user) {
          // Successfully logged in
          navigate('/');
        }
      } catch (err) {
        setAuthError(err.message || t('login_failed'));
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle remember me checkbox change
  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh" 
      sx={{
        backgroundImage: 'url(/logonr.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for better text readability
          zIndex: 1
        }
      }}
    >
      <Paper 
        elevation={8} 
        sx={{ 
          p: 4, 
          width: { xs: '90%', sm: 400 }, 
          maxWidth: '100%',
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // Semi-transparent white
          backdropFilter: 'blur(10px)', // Glass effect
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3} align="center">{t('sign_in_to')} Next NR-GIE</Typography>
        
        {authError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {authError}
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label={t('email')}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t('enter_email')}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={formik.isSubmitting}
          />
          <TextField
            fullWidth
            margin="normal"
            label={t('password')}
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={t('enter_password')}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={formik.isSubmitting}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} mb={2}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  name="rememberMe"
                  color="primary"
                  size="small"
                />
              }
              label={<Typography variant="body2">{t('remember_me')}</Typography>}
            />
            <Typography 
              variant="body2" 
              color="primary" 
              component="a" 
              href="/reset-password"
              sx={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              {t('forgot_password')}
            </Typography>
          </Box>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 1, py: 1.2 }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? <CircularProgress size={24} /> : t('sign_in')}
          </Button>
        </form>
        
      </Paper>
    </Box>
  );
};

export default Login;
