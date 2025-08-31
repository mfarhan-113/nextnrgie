import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Grid, Alert, CircularProgress, Divider } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { registerWithEmailAndPassword, signInWithGoogle } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [authError, setAuthError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
      displayName: Yup.string().required('Full name is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setAuthError('');
      setSuccess('');
      try {
        const { confirmPassword, ...userData } = values;
        const { user, error } = await registerWithEmailAndPassword(
          userData.email, 
          userData.password,
          userData.displayName
        );
        
        if (error) {
          setAuthError(error);
        } else if (user) {
          setSuccess('Account created successfully!');
          // Redirect to dashboard after short delay
          setTimeout(() => navigate('/'), 1500);
        }
      } catch (err) {
        setAuthError(err.message || 'Failed to create account. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError('');
    try {
      const { user, error } = await signInWithGoogle();
      
      if (error) {
        setAuthError(error);
      } else if (user) {
        // Successfully logged in with Google
        navigate('/');
      }
    } catch (err) {
      setAuthError(err.message || 'Failed to sign up with Google. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6f8">
      <Paper elevation={3} sx={{ p: 4, width: { xs: '90%', sm: 400 }, maxWidth: '100%' }}>
        <Typography variant="h5" fontWeight="bold" mb={3} align="center">Create Account</Typography>
        
        {authError && <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            name="displayName"
            autoComplete="name"
            value={formik.values.displayName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.displayName && Boolean(formik.errors.displayName)}
            helperText={formik.touched.displayName && formik.errors.displayName}
            disabled={formik.isSubmitting}
          />
          
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
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={formik.isSubmitting}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
        </form>
        
        <Box sx={{ my: 3, position: 'relative' }}>
          <Divider>
            <Typography variant="body2" sx={{ px: 1, color: 'text.secondary' }}>
              OR
            </Typography>
          </Divider>
        </Box>
        
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          sx={{ mb: 3, py: 1.2 }}
        >
          {isGoogleLoading ? <CircularProgress size={24} /> : 'Sign up with Google'}
        </Button>
        
        <Typography variant="body2" align="center">
          Already have an account?{' '}
          <Typography 
            component="a" 
            href="/login" 
            color="primary"
            sx={{ textDecoration: 'none', fontWeight: 'medium', cursor: 'pointer' }}
          >
            Sign In
          </Typography>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Signup;
