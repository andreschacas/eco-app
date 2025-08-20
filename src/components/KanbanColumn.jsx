import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const KanbanColumn = ({ title, children, onAddCard }) => {
  return (
    <Paper elevation={3} sx={{ bgcolor: '#fffbe6', borderRadius: 3, p: 2, minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>{title}</Typography>
      <div style={{ flex: 1 }}>{children}</div>
      <Button variant="text" sx={{ mt: 1, color: '#1976d2', justifyContent: 'flex-start' }} onClick={onAddCard} startIcon={<span style={{ fontWeight: 'bold', fontSize: 18 }}>+</span>}>
        Add a card
      </Button>
    </Paper>
  );
};

export default KanbanColumn;