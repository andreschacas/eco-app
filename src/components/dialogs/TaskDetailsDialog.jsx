import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

const labelColors = ['#1976d2', '#43a047', '#fbc02d', '#e57373', '#8e24aa'];

const TaskDetailsDialog = ({ open, onClose, card, onEdit, onDelete }) => {
  if (!card) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>{card.title}</Typography>
        <Button color="primary" onClick={onEdit}>Editar</Button>
        <Button color="error" onClick={onDelete}>Eliminar</Button>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {card.labels && card.labels.map((label, idx) => (
            <Chip key={idx} label={label} size="small" sx={{ bgcolor: labelColors[idx % labelColors.length], color: '#fff', fontWeight: 500 }} />
          ))}
        </Stack>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Descripción</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>{card.description || 'Sin descripción'}</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          {card.dueDate && <Chip label={`Fecha límite: ${card.dueDate}`} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500 }} />}
          {card.user && (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar src={card.user.avatar} alt={card.user.name} sx={{ width: 32, height: 32 }} />
              <Typography variant="body2">{card.user.name} ({card.user.role})</Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailsDialog;