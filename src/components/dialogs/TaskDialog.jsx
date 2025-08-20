import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const TaskDialog = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = React.useState(
    initialData || { title: '', description: '', dueDate: '', user: null }
  );

  React.useEffect(() => {
    setForm(initialData || { title: '', description: '', dueDate: '', user: null });
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialData ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="Título"
          type="text"
          fullWidth
          value={form.title}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="description"
          label="Descripción"
          type="text"
          fullWidth
          value={form.description}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="dueDate"
          label="Fecha límite"
          type="date"
          fullWidth
          value={form.dueDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        {/* Aquí puedes agregar campos para etiquetas y usuario */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog; 