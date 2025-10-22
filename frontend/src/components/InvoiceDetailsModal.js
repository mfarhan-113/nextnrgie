import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addDays } from 'date-fns';

const InvoiceDetailsModal = ({ open, onClose, onConfirm, invoice }) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date());
  const [expirationDate, setExpirationDate] = useState(addDays(new Date(), 30));

  useEffect(() => {
    if (invoice) {
      // Set default values when invoice changes
      setInvoiceNumber(invoice.name || `INV-${new Date().getTime()}`);
      
      // Handle issue date (use current date if not set)
      const today = new Date();
      const issueDate = invoice.issue_date ? 
        (typeof invoice.issue_date === 'string' ? new Date(invoice.issue_date) : invoice.issue_date) : 
        today;
      
      // Handle expiration date (default to 30 days from issue date)
      const expirationDate = invoice.expiration_date ? 
        (typeof invoice.expiration_date === 'string' ? new Date(invoice.expiration_date) : invoice.expiration_date) : 
        addDays(issueDate, 30);
      
      setIssueDate(issueDate);
      setExpirationDate(expirationDate);
    }
  }, [invoice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!invoiceNumber || !issueDate || !expirationDate) {
      return; // Don't submit if any required field is missing
    }
    
    // Format dates to YYYY-MM-DD
    const formatDate = (date) => {
      if (!date) return '';
      try {
        return format(new Date(date), 'yyyy-MM-dd');
      } catch (e) {
        console.error('Error formatting date:', e);
        return '';
      }
    };
    
    onConfirm({
      invoiceNumber: invoiceNumber.trim(),
      issueDate: formatDate(issueDate),
      expirationDate: formatDate(expirationDate)
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
              fullWidth
              margin="normal"
            />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Issue Date"
                value={issueDate}
                onChange={(newValue) => setIssueDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                    required: true
                  }
                }}
              />
              
              <DatePicker
                label="Expiration Date"
                value={expirationDate}
                onChange={(newValue) => setExpirationDate(newValue)}
                minDate={issueDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                    required: true
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Generate PDF
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InvoiceDetailsModal;
