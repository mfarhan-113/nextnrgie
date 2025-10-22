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
      setInvoiceNumber(invoice.name || '');
      setIssueDate(invoice.creation_date ? new Date(invoice.creation_date) : new Date());
      setExpirationDate(invoice.expiration_date ? new Date(invoice.expiration_date) : addDays(new Date(), 30));
    }
  }, [invoice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      invoiceNumber,
      issueDate: format(issueDate, 'yyyy-MM-dd'),
      expirationDate: format(expirationDate, 'yyyy-MM-dd')
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
