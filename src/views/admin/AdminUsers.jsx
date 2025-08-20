import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dataService from '../../utils/dataService';
import { UserTableSkeleton } from '../../components/common/LoadingSkeleton';

const GREEN = '#2AAC26';

const AdminUsers = ({ onNavigate }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [positions, setPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '',
    position_name: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Simular carga async para mostrar skeleton
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const usersData = dataService.getAll('users').filter(user => user.active);
      const rolesData = dataService.getAll('roles');
      const positionsData = dataService.getAll('positions');
    
      setUsers(usersData);
      setRoles(rolesData);
      setPositions(positionsData);
    } catch (error) {
      showSnackbar('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Desconocido';
  };

  const getPositionName = (positionId) => {
    const position = positions.find(p => p.id === positionId);
    return position ? position.name : 'Desconocido';
  };

  const getOrCreatePositionId = (positionName) => {
    // Buscar si ya existe el cargo
    let position = positions.find(p => p.name.toLowerCase() === positionName.toLowerCase());
    
    if (!position) {
      // Crear nuevo cargo si no existe
      const newPosition = {
        name: positionName,
        created_at: new Date().toISOString()
      };
      position = dataService.create('positions', newPosition);
      // Actualizar la lista local de cargos
      setPositions(prev => [...prev, position]);
    }
    
    return position.id;
  };

  const getRoleColor = (roleId) => {
    switch (roleId) {
      case 1: return '#e53935'; // Administrador
      case 2: return '#1e88e5'; // Coordinador
      case 3: return '#43a047'; // Participante
      default: return '#757575';
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role_id: user.role_id,
        position_name: getPositionName(user.position_id)
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role_id: '',
        position_name: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role_id: '',
      position_id: ''
    });
  };

  const handleSaveUser = async () => {
    try {
      if (!formData.name || !formData.email || !formData.role_id || !formData.position_name) {
        showSnackbar('Por favor complete todos los campos obligatorios', 'error');
        return;
      }

      // Obtener o crear el position_id basado en position_name
      const position_id = getOrCreatePositionId(formData.position_name);

      if (editingUser) {
        // Actualizar usuario existente
        const updateData = { 
          ...formData, 
          position_id 
        };
        delete updateData.position_name; // Remover position_name ya que usamos position_id
        if (!updateData.password) {
          delete updateData.password; // No actualizar contraseña si está vacía
        }
        dataService.update('users', editingUser.id, updateData);
        showSnackbar('Usuario actualizado exitosamente', 'success');
      } else {
        // Crear nuevo usuario
        if (!formData.password) {
          showSnackbar('La contraseña es obligatoria para nuevos usuarios', 'error');
          return;
        }
        
        // Verificar que el email no exista
        const existingUser = dataService.getUserByEmail(formData.email);
        if (existingUser) {
          showSnackbar('Ya existe un usuario con este email', 'error');
          return;
        }

        const userData = { 
          ...formData, 
          position_id 
        };
        delete userData.position_name; // Remover position_name ya que usamos position_id

        dataService.create('users', {
          ...userData,
          active: true,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`
        });
        showSnackbar('Usuario creado exitosamente', 'success');
      }

      await loadData();
      handleCloseDialog();
    } catch (error) {
      showSnackbar('Error al guardar el usuario', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      // Eliminación lógica - cambiar estado a inactivo
      dataService.update('users', userId, { active: false });
      showSnackbar('Usuario desactivado exitosamente', 'success');
      await loadData();
    } catch (error) {
      showSnackbar('Error al desactivar el usuario', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={() => onNavigate('admin-dashboard')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
          Gestión de Usuarios
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            Administrar usuarios del sistema ECO
        </Typography>
      </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
              sx={{
                bgcolor: GREEN,
                textTransform: 'none',
                fontFamily: 'Poppins, sans-serif',
                '&:hover': { bgcolor: '#1f9a1f' }
              }}
            >
              Nuevo Usuario
            </Button>
          </Box>

      {/* Search */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar usuarios por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#666' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'Poppins, sans-serif'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      {loading ? (
        <UserTableSkeleton rows={8} />
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Cargo</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Fecha Registro</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                    <TableCell>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          '&:hover': {
                            '& .MuiTypography-root': {
                              color: GREEN,
                              textDecoration: 'underline'
                            }
                          }
                        }}
                        onClick={() => onNavigate('user-profile', { userId: user.id })}
                      >
                        <Avatar src={user.avatar} alt={user.name} sx={{ mr: 2 }} />
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600, 
                            fontFamily: 'Poppins, sans-serif',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleName(user.role_id)}
                        size="small"
                        sx={{
                          bgcolor: `${getRoleColor(user.role_id)}20`,
                          color: getRoleColor(user.role_id),
                          fontFamily: 'Poppins, sans-serif'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                        {getPositionName(user.position_id)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                        {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                        <IconButton
                          size="small"
                        onClick={() => handleOpenDialog(user)}
                        sx={{ mr: 1, color: GREEN }}
                        >
                        <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        sx={{ color: '#f44336' }}
                        >
                        <DeleteIcon />
                        </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          sx={{ fontFamily: 'Poppins, sans-serif' }}
        />
      </Card>
      )}

      {/* Dialog for Create/Edit User */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              sx={{ fontFamily: 'Poppins, sans-serif' }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              sx={{ fontFamily: 'Poppins, sans-serif' }}
            />
            <TextField
              fullWidth
              label={editingUser ? "Nueva contraseña (opcional)" : "Contraseña"}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              sx={{ fontFamily: 'Poppins, sans-serif' }}
            />
            <FormControl fullWidth required>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                label="Rol"
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Autocomplete
              freeSolo
              options={positions.map(position => position.name)}
              value={formData.position_name}
              onChange={(event, newValue) => {
                setFormData({ ...formData, position_name: newValue || '' });
              }}
              onInputChange={(event, newInputValue) => {
                setFormData({ ...formData, position_name: newInputValue });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cargo"
                  required
                  helperText="Selecciona un cargo existente o escribe uno nuevo"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ fontFamily: 'Poppins, sans-serif' }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained" 
            sx={{ 
              bgcolor: GREEN, 
              fontFamily: 'Poppins, sans-serif',
              '&:hover': { bgcolor: '#1f9a1f' }
            }}
          >
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsers;
