import React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

const QuickActions = ({ onAddTask, onFilter }) => {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
      <Button variant="contained" sx={{ bgcolor: '#2AAC26', color: '#fff', fontFamily: 'Poppins, sans-serif', textTransform: 'none', fontWeight: 600 }} onClick={onAddTask}>+ Añadir tarea</Button>
      <Button variant="outlined" sx={{ fontFamily: 'Poppins, sans-serif', color: '#2AAC26', borderColor: '#2AAC26', textTransform: 'none', fontWeight: 600 }} onClick={() => onFilter('categoria')}>Filtrar por categoría</Button>
      <Button variant="outlined" sx={{ fontFamily: 'Poppins, sans-serif', color: '#2AAC26', borderColor: '#2AAC26', textTransform: 'none', fontWeight: 600 }} onClick={() => onFilter('prioridad')}>Filtrar por prioridad</Button>
    </Stack>
  );
};

export default QuickActions; 