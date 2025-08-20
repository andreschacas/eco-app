import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

const labelColors = ['#2AAC26', '#43a047', '#fbc02d', '#e57373', '#8e24aa'];

const KanbanCard = ({ title, description, dueDate, user, dragHandleProps, onClick }) => {
  return (
    <Paper
      elevation={1}
      sx={{ borderRadius: 2, p: 2, mb: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', cursor: 'pointer', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.13)' }, fontFamily: 'Poppins, sans-serif' }}
      onClick={onClick}
    >
      {/* Barra superior como drag handle */}
      <Box {...dragHandleProps} sx={{ height: 16, mb: 1, cursor: 'grab' }} />
      {/* Elimino el Stack de labels */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#222', fontFamily: 'Poppins, sans-serif' }}>{title}</Typography>
      {description && <Typography variant="body2" sx={{ color: '#555', mb: 1, fontFamily: 'Poppins, sans-serif' }}>{description}</Typography>}
      <Stack direction="row" alignItems="center" spacing={1}>
        {dueDate && <Chip label={dueDate} size="small" sx={{ bgcolor: '#e3f2fd', color: '#2AAC26', fontWeight: 500, fontFamily: 'Poppins, sans-serif' }} />}
        {user && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Avatar src={user.avatar} alt={user.name} sx={{ width: 24, height: 24 }} />
            <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>{user.name}</Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default KanbanCard; 