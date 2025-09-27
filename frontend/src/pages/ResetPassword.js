import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { resetPassword, confirmPasswordReset, verifyPasswordResetCode } from '../firebase/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  
  const [success, setSuccess] = useState('');
  const [authError, setAuthError] = useState('');
  const [email, setEmail] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(!!oobCode);

  // Handle password reset action mode
  useEffect(() => {
    const verifyResetCode = async () => {
      if (mode === 'resetPassword' && oobCode) {
        try {
          const email = await verifyPasswordResetCode(oobCode);
          setEmail(email);
          setVerified(true);
        } catch (error) {
          setAuthError('Invalid or expired reset link. Please request a new password reset.');
        } finally {
          setLoading(false);
        }
      }
    };

    verifyResetCode();
  }, [mode, oobCode]);

  // Handle password reset request
  const handleResetRequest = async (values, { setSubmitting }) => {
    setAuthError('');
    setSuccess('');
    try {
      const { success, error } = await resetPassword(values.email);
      
      if (error) {
        setAuthError(error);
      } else if (success) {
        setSuccess('Password reset email sent! Check your inbox.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setAuthError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle password update
  const handleResetPassword = async (values, { setSubmitting }) => {
    setAuthError('');
    setSuccess('');
    try {
      await confirmPasswordReset(oobCode, values.newPassword);
      setSuccess('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setAuthError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Formik configuration for reset request
  const requestFormik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: handleResetRequest,
  });

  // Formik configuration for password update
  const resetFormik = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: handleResetPassword,
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6f8">
        <CircularProgress />
      </Box>
    );
  }

  // Show password reset form if in action mode and verified
  if (mode === 'resetPassword' && oobCode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6f8">
        <Paper elevation={3} sx={{ p: 4, width: { xs: '90%', sm: 400 }, maxWidth: '100%' }}>
          <Typography variant="h5" fontWeight="bold" mb={2} align="center">
            Reset Your Password
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3} align="center">
            {verified 
              ? `Enter a new password for ${email}`
              : 'Invalid or expired reset link'}
          </Typography>
          
          {authError && <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          {verified && (
            <form onSubmit={resetFormik.handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="New Password"
                name="newPassword"
                type="password"
                value={resetFormik.values.newPassword}
                onChange={resetFormik.handleChange}
                onBlur={resetFormik.handleBlur}
                error={resetFormik.touched.newPassword && Boolean(resetFormik.errors.newPassword)}
                helperText={resetFormik.touched.newPassword && resetFormik.errors.newPassword}
                disabled={resetFormik.isSubmitting}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={resetFormik.values.confirmPassword}
                onChange={resetFormik.handleChange}
                onBlur={resetFormik.handleBlur}
                error={resetFormik.touched.confirmPassword && Boolean(resetFormik.errors.confirmPassword)}
                helperText={resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword}
                disabled={resetFormik.isSubmitting}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{ py: 1.2 }}
                disabled={resetFormik.isSubmitting}
              >
                {resetFormik.isSubmitting ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
            </form>
          )}
          
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  // Show password reset request form by default
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6f8">
      <Paper elevation={3} sx={{ p: 4, width: { xs: '90%', sm: 400 }, maxWidth: '100%' }}>
        <Typography variant="h5" fontWeight="bold" mb={2} align="center">
          Reset Password
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3} align="center">
          Enter your email address and we'll send you a link to reset your password.
        </Typography>
        
        {authError && <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <form onSubmit={requestFormik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email Address"
            name="email"
            type="email"
            value={requestFormik.values.email}
            onChange={requestFormik.handleChange}
            onBlur={requestFormik.handleBlur}
            error={requestFormik.touched.email && Boolean(requestFormik.errors.email)}
            helperText={requestFormik.touched.email && requestFormik.errors.email}
            disabled={requestFormik.isSubmitting}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2, py: 1.2 }}
            disabled={requestFormik.isSubmitting}
          >
            {requestFormik.isSubmitting ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
        </form>
        
        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
