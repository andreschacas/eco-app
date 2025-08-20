import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';

const KanbanColumn = ({ title, onAddCard, onRename, onMenuAction, children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(title);

  useEffect(() => {
    setName(title);
  }, [title]);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleRename = () => {
    if (name.trim() && name !== title) {
      onRename?.(name.trim());
    }
    setEditing(false);
  };
  const handleRenameSubmit = (e) => {
    e.preventDefault();
    setEditing(false);
    if (onRename) onRename(name);
  };

  const handleMenuClick = (action) => {
    onMenuAction?.(action);
  };

  return (
    <Paper elevation={3} sx={{ bgcolor: '#fffbe6', borderRadius: 3, p: 2, minHeight: '60vh', display: 'flex', flexDirection: 'column', fontFamily: 'Poppins, sans-serif' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {editing ? (
          <form onSubmit={handleRenameSubmit} style={{ flex: 1 }}>
            <TextField
              value={name}
              onChange={e => setName(e.target.value)}
              size="small"
              autoFocus
              onBlur={handleRename}
              variant="standard"
              inputProps={{ style: { fontWeight: 700, fontSize: 20, fontFamily: 'Poppins, sans-serif' } }}
            />
          </form>
        ) : (
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: '#333', fontFamily: 'Poppins, sans-serif', flex: 1, cursor: 'pointer' }}
            onClick={() => setEditing(true)}
            title="Editar nombre de la lista"
          >
            {name}
          </Typography>
        )}
        <IconButton size="small" onClick={handleMenuOpen} sx={{ ml: 1 }}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleMenuClick('archive')}>Archivar lista</MenuItem>
          <MenuItem onClick={() => handleMenuClick('copy')}>Copiar lista</MenuItem>
          <MenuItem onClick={() => handleMenuClick('delete')}>Eliminar lista</MenuItem>
          <MenuItem onClick={() => handleMenuClick('add_card')}>Agregar tarjeta</MenuItem>
        </Menu>
      </Box>
      <div style={{ flex: 1 }}>{children}</div>
      <Button variant="text" sx={{ mt: 1, color: '#2AAC26', justifyContent: 'flex-start', fontFamily: 'Poppins, sans-serif' }} onClick={onAddCard} startIcon={<span style={{ fontWeight: 'bold', fontSize: 18 }}>+</span>}>
        Add a card
      </Button>
    </Paper>
  );
};

export default KanbanColumn; 