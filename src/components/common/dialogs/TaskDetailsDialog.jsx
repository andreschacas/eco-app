import React, { useState } from 'react';
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
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import InputAdornment from '@mui/material/InputAdornment';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CommentIcon from '@mui/icons-material/Comment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import dayjs from 'dayjs';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const accentGray = '#23272f';
const lightGray = '#23272f';
const midGray = '#353942';
const borderGray = '#444851';
const chipGray = '#bdbdbd';
const chipBg = '#23272f';
const chipText = '#fff';
const sectionTitleStyle = { fontWeight: 600, color: midGray, mb: 1, fontFamily: 'Poppins, sans-serif', fontSize: 16 };

const TaskDetailsDialog = ({ open, onClose, card, onEdit, onDelete, onUpdate }) => {
  if (!card) return null;
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [dueDate, setDueDate] = useState(card?.dueDate || '');
  const [members, setMembers] = useState(card?.members || (card?.user ? [card.user] : []));
  const [checklist, setChecklist] = useState(card?.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [attachments, setAttachments] = useState(card?.attachments || []);
  const [comments, setComments] = useState(card?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [expanded, setExpanded] = useState(null); // 'checklist', 'members', 'attachments', 'comments', null

  React.useEffect(() => {
    setTitle(card?.title || '');
    setDescription(card?.description || '');
    setDueDate(card?.dueDate || '');
    setMembers(card?.members || (card?.user ? [card.user] : []));
    setChecklist(card?.checklist || []);
    setAttachments(card?.attachments || []);
    setComments(card?.comments || []);
  }, [card]);

  // Actualización global
  const updateCard = (changes) => {
    if (!card) return;
    const updated = { ...card, ...changes };
    setTitle(updated.title);
    setDescription(updated.description);
    setDueDate(updated.dueDate);
    setMembers(updated.members);
    setChecklist(updated.checklist);
    setAttachments(updated.attachments);
    onUpdate && onUpdate(updated);
  };

  // --- Handlers ---
  const handleTitleEdit = () => setEditingTitle(true);
  const handleTitleSave = () => {
    setEditingTitle(false);
    if (title !== card?.title) {
      updateCard({ title });
    }
  };
  const handleDueDateChange = (date) => {
    setDueDate(date);
    updateCard({ dueDate: date });
  };
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };
  const handleDescriptionBlur = (e) => {
    if (e.target.value !== card?.description) {
      updateCard({ description: e.target.value });
    }
  };
  const handleAddMember = () => {
    // Lógica para agregar miembro (mock)
    const name = prompt('Nombre del miembro:');
    if (name) {
      const newMembers = [...members, { name, avatar: '', role: 'Colaborador' }];
      setMembers(newMembers);
      updateCard({ members: newMembers });
    }
  };
  const handleRemoveMember = (idx) => {
    const newMembers = members.filter((_, i) => i !== idx);
    setMembers(newMembers);
    updateCard({ members: newMembers });
  };
  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newChecklist = [...checklist, { text: newChecklistItem, done: false }];
      setChecklist(newChecklist);
      setNewChecklistItem('');
      updateCard({ checklist: newChecklist });
    }
  };
  const handleToggleChecklist = (idx) => {
    const newChecklist = checklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item);
    setChecklist(newChecklist);
    updateCard({ checklist: newChecklist });
  };
  const handleDeleteChecklistItem = (idx) => {
    const newChecklist = checklist.filter((_, i) => i !== idx);
    setChecklist(newChecklist);
    updateCard({ checklist: newChecklist });
  };
  const handleAddAttachment = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newAttachments = [...attachments, { name: file.name, url: URL.createObjectURL(file) }];
      setAttachments(newAttachments);
      updateCard({ attachments: newAttachments });
    }
  };
  const handleDeleteAttachment = (idx) => {
    const newAttachments = attachments.filter((_, i) => i !== idx);
    setAttachments(newAttachments);
    updateCard({ attachments: newAttachments });
  };
  const handleAddComment = () => {
    if (newComment.trim()) {
      const newComments = [...comments, { text: newComment, date: new Date().toISOString() }];
      setComments(newComments);
      setNewComment('');
      updateCard({ comments: newComments });
    }
  };

  const handleExpand = (section) => {
    setExpanded(expanded === section ? null : section);
  };

  // --- Render ---
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, fontFamily: 'Poppins, sans-serif', bgcolor: '#e9ecef', borderRadius: '16px 16px 0 0', minHeight: 56, px: 3, pt: 1.5, pb: 1 }}>
        {/* Nombre de la tabla */}
        <Typography variant="caption" sx={{ color: '#43a047', fontWeight: 500, letterSpacing: 1, mb: 0.5, fontFamily: 'Poppins, sans-serif', fontSize: 12 }}>KANBAN</Typography>
        {/* Nombre de la tarjeta */}
        {editingTitle ? (
          <TextField
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setEditingTitle(false); }}
            size="small"
            autoFocus
            sx={{ fontWeight: 600, fontSize: 16, bgcolor: '#fff', borderRadius: 2, fontFamily: 'Poppins, sans-serif', color: '#222', mb: 1, width: '100%' }}
            inputProps={{ style: { fontWeight: 600, fontSize: 16, fontFamily: 'Poppins, sans-serif', color: '#222' } }}
          />
        ) : (
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 16, color: '#222', cursor: 'pointer', letterSpacing: 0.2, mb: 1, width: '100%' }} onClick={handleTitleEdit}>{title}</Typography>
        )}
        {/* Barra de acciones */}
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%', mb: 1 }}>
          <Button onClick={() => handleExpand('add')} variant={expanded==='add'?'contained':'outlined'} sx={{ textTransform: 'none', fontWeight: 500, fontSize: 13, color: '#2AAC26', borderColor: '#2AAC26', bgcolor: expanded==='add'?'#e8f5e9':'#fff', borderRadius: 2, px: 2, minWidth: 0 }} startIcon={<AddIcon />}>Añadir</Button>
          <Button onClick={() => handleExpand('checklist')} variant={expanded==='checklist'?'contained':'outlined'} sx={{ textTransform: 'none', fontWeight: 500, fontSize: 13, color: '#2AAC26', borderColor: '#2AAC26', bgcolor: expanded==='checklist'?'#e8f5e9':'#fff', borderRadius: 2, px: 2, minWidth: 0 }} startIcon={<ChecklistIcon />}>Checklist</Button>
          <Button onClick={() => handleExpand('members')} variant={expanded==='members'?'contained':'outlined'} sx={{ textTransform: 'none', fontWeight: 500, fontSize: 13, color: '#2AAC26', borderColor: '#2AAC26', bgcolor: expanded==='members'?'#e8f5e9':'#fff', borderRadius: 2, px: 2, minWidth: 0 }} startIcon={<PersonAddIcon />}>Miembros</Button>
          <Button onClick={() => handleExpand('attachments')} variant={expanded==='attachments'?'contained':'outlined'} sx={{ textTransform: 'none', fontWeight: 500, fontSize: 13, color: '#2AAC26', borderColor: '#2AAC26', bgcolor: expanded==='attachments'?'#e8f5e9':'#fff', borderRadius: 2, px: 2, minWidth: 0 }} startIcon={<AttachFileIcon />}>Adjunto</Button>
          <IconButton onClick={onClose} sx={{ ml: 'auto', color: '#888', bgcolor: '#e9ecef', '&:hover': { bgcolor: '#c8e6c9' } }}><span style={{ fontWeight: 'bold', fontSize: 20 }}>×</span></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ fontFamily: 'Poppins, sans-serif', bgcolor: '#f8fafb', px: 3, pt: 2, pb: 1 }}>
        {/* Elimino la fila de etiquetas, solo queda vencimiento y descripción */}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, mb: 2 }}>
          {/* Vencimiento */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon sx={{ color: '#2AAC26' }} />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Vencimiento"
                value={dueDate ? new Date(dueDate) : null}
                onChange={date => setDueDate(date ? date.toISOString().slice(0, 10) : '')}
                renderInput={(params) => <TextField {...params} size="small" sx={{ width: 110, bgcolor: '#fff', borderRadius: 2, color: '#222', input: { color: '#222', fontSize: 13 } }} />}
              />
            </LocalizationProvider>
            {dueDate && dayjs(dueDate).isBefore(dayjs(), 'day') && (
              <Chip label="Plazo vencido" size="small" sx={{ bgcolor: '#b71c1c', color: '#fff', fontWeight: 500, ml: 1, borderRadius: 2, fontSize: 13 }} />
            )}
          </Box>
        </Box>
        {/* Descripción igual */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 600, color: '#222', mb: 1, fontFamily: 'Poppins, sans-serif', fontSize: 14 }}>Descripción</Typography>
          <TextField
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            multiline
            minRows={3}
            fullWidth
            placeholder="Añadir una descripción más detallada..."
            sx={{ bgcolor: '#fff', borderRadius: 2, fontWeight: 500, color: '#222', input: { color: '#222', fontSize: 13 } }}
            inputProps={{ style: { fontFamily: 'Poppins, sans-serif', fontWeight: 500, color: '#222', fontSize: 13 } }}
          />
        </Box>
        <Divider sx={{ mb: 2, bgcolor: '#e0e0e0' }} />
        {/* Expansiones */}
        <Collapse in={expanded==='checklist'} timeout="auto" unmountOnExit>
          {/* Checklist UI aquí */}
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f4f6fa', borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 600, color: '#2AAC26', mb: 1, fontFamily: 'Poppins, sans-serif', fontSize: 16 }}>Checklist</Typography>
            <Stack spacing={1}>
              {checklist.map((item, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1} sx={{ bgcolor: '#fff', borderRadius: 2, px: 1, py: 0.5 }}>
                  <input type="checkbox" checked={item.done} onChange={() => handleToggleChecklist(idx)} style={{ accentColor: '#2AAC26' }} />
                  <Typography variant="body2" sx={{ textDecoration: item.done ? 'line-through' : 'none', fontWeight: 500 }}>{item.text}</Typography>
                  <IconButton size="small" onClick={() => handleDeleteChecklistItem(idx)} sx={{ color: '#e57373' }}><span style={{ fontWeight: 'bold' }}>×</span></IconButton>
                </Box>
              ))}
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  value={newChecklistItem}
                  onChange={e => setNewChecklistItem(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddChecklistItem(); }}
                  size="small"
                  placeholder="Nueva tarea"
                  sx={{ width: 200, bgcolor: '#fff', borderRadius: 2 }}
                />
                <Button size="small" onClick={handleAddChecklistItem} sx={{ color: '#fff', bgcolor: '#2AAC26', fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: '#43a047' } }}>Añadir</Button>
              </Box>
            </Stack>
          </Box>
        </Collapse>
        <Collapse in={expanded==='members'} timeout="auto" unmountOnExit>
          {/* Miembros UI aquí */}
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f4f6fa', borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 600, color: '#2AAC26', mb: 1, fontFamily: 'Poppins, sans-serif', fontSize: 16 }}>Miembros</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              {members.map((member, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1} sx={{ bgcolor: '#fff', borderRadius: 2, px: 1, py: 0.5, boxShadow: '0 1px 2px rgba(42,172,38,0.04)' }}>
                  <Avatar src={member.avatar} alt={member.name} sx={{ width: 32, height: 32, border: '2px solid #2AAC26' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{member.name}</Typography>
                  <IconButton size="small" onClick={() => handleRemoveMember(idx)} sx={{ color: '#e57373' }}><span style={{ fontWeight: 'bold' }}>×</span></IconButton>
                </Box>
              ))}
              <IconButton size="small" onClick={handleAddMember} sx={{ bgcolor: '#e8f5e9', '&:hover': { bgcolor: '#c8e6c9' } }}><PersonAddIcon sx={{ color: '#2AAC26' }} /></IconButton>
            </Stack>
          </Box>
        </Collapse>
        <Collapse in={expanded==='attachments'} timeout="auto" unmountOnExit>
          {/* Adjuntos UI aquí */}
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f4f6fa', borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 600, color: '#2AAC26', mb: 1, fontFamily: 'Poppins, sans-serif', fontSize: 16 }}>Adjuntos</Typography>
            <Stack spacing={1}>
              {attachments.map((file, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1} sx={{ bgcolor: '#fff', borderRadius: 2, px: 1, py: 0.5 }}>
                  <AttachFileIcon fontSize="small" sx={{ color: '#2AAC26' }} />
                  <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2AAC26', fontWeight: 500 }}>{file.name}</a>
                  <IconButton size="small" onClick={() => handleDeleteAttachment(idx)} sx={{ color: '#e57373' }}><span style={{ fontWeight: 'bold' }}>×</span></IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        </Collapse>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ fontFamily: 'Poppins, sans-serif' }}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailsDialog; 