import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

const labelColors = ['#1976d2', '#43a047', '#fbc02d', '#e57373', '#8e24aa'];

const KanbanCard = ({ title, description, dueDate, labels, user, dragHandleProps, onClick }) => {
  return (
    <Paper
      elevation={1}
      sx={{ borderRadius: 2, p: 2, mb: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', cursor: 'pointer', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.13)' } }}
      onClick={onClick}
    >
      {/* Barra superior como drag handle */}
      <Box {...dragHandleProps} sx={{ height: 16, mb: 1, cursor: 'grab' }} />
      <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
        {labels && labels.map((label, idx) => (
          <Chip key={idx} label={label} size="small" sx={{ bgcolor: labelColors[idx % labelColors.length], color: '#fff', fontWeight: 500 }} />
        ))}
      </Stack>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#222' }}>{title}</Typography>
      {description && <Typography variant="body2" sx={{ color: '#555', mb: 1 }}>{description}</Typography>}
      <Stack direction="row" alignItems="center" spacing={1}>
        {dueDate && <Chip label={dueDate} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500 }} />}
        {user && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Avatar src={user.avatar} alt={user.name} sx={{ width: 24, height: 24 }} />
            <Typography variant="caption" sx={{ color: '#666' }}>{user.name}</Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default KanbanCard;