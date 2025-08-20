import React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

const QuickActions = ({ onAddTask, onFilter }) => {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <Button variant="contained" color="primary" onClick={onAddTask}>+ Añadir tarea</Button>
      <Button variant="outlined" onClick={() => onFilter('categoria')}>Filtrar por categoría</Button>
      <Button variant="outlined" onClick={() => onFilter('prioridad')}>Filtrar por prioridad</Button>
    </Stack>
  );
};

export default QuickActions;
