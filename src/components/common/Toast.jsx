import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const Toast = ({ open, message, severity = 'success', onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 500,
          '& .MuiAlert-message': {
            fontSize: '0.9rem'
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;