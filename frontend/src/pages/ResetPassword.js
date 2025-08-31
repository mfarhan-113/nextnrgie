import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { resetPassword } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [authError, setAuthError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setAuthError('');
      setSuccess('');
      try {
        const { success, error } = await resetPassword(values.email);
        
        if (error) {
          setAuthError(error);
        } else if (success) {
          setSuccess('Password reset email sent! Check your inbox.');
          // Redirect to login after short delay
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        setAuthError(err.message || 'Failed to send reset email. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6f8">
      <Paper elevation={3} sx={{ p: 4, width: { xs: '90%', sm: 400 }, maxWidth: '100%' }}>
        <Typography variant="h5" fontWeight="bold" mb={2} align="center">Reset Password</Typography>
        <Typography variant="body2" color="text.secondary" mb={3} align="center">
          Enter your email address and we'll send you a link to reset your password.
        </Typography>
        
        {authError && <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={formik.isSubmitting}
            sx={{ mb: 2 }}
          />
          
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 1, py: 1.2 }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
          
          <Box mt={3} textAlign="center">
            <Typography 
              variant="body2" 
              component="a" 
              href="/login"
              color="primary"
              sx={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              Back to Sign In
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
