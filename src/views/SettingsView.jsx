import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/auth/AuthContext';
import dataService from '../utils/dataService';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const GREEN = '#2AAC26';

const SettingsView = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    location: '',
    bio: '',
    avatar: ''
  });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user) {
      // Cargar datos del usuario desde dataService
      const userData = dataService.getUserById(user.id);
      if (userData) {
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: getRoleName(userData.role_id) || '',
          department: userData.department || '',
          location: userData.location || '',
          bio: userData.bio || '',
          avatar: userData.avatar || ''
        });
      }
    }
  }, [user]);

  const getRoleName = (roleId) => {
    const roles = dataService.getAll('roles');
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Desconocido';
  };



  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };



  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showSnackbar('La imagen debe ser menor a 2MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newAvatar = e.target.result;
        setProfileData(prev => ({ ...prev, avatar: newAvatar }));
        
        // Guardar inmediatamente en localStorage
        try {
          dataService.update('users', user.id, { avatar: newAvatar });
          // Actualizar el contexto de auth para que se refleje en el navbar
          updateUser({ avatar: newAvatar });
          showSnackbar('Avatar actualizado exitosamente', 'success');
        } catch (error) {
          showSnackbar('Error al actualizar el avatar', 'error');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    try {
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        department: profileData.department,
        location: profileData.location,
        bio: profileData.bio
      };
      
      dataService.update('users', user.id, updateData);
      showSnackbar('Perfil actualizado exitosamente', 'success');
    } catch (error) {
      showSnackbar('Error al actualizar el perfil', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box sx={{ p: 3, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, fontFamily: 'Poppins, sans-serif' }}>
        Configuración
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccountCircleIcon sx={{ color: GREEN, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  Perfil de Usuario
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                <Avatar
                    src={profileData.avatar || `https://i.pravatar.cc/150?img=${user?.id || 5}`}
                  alt={profileData.name}
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton
                      component="span"
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        bottom: 0,
                        right: 16,
                        bgcolor: GREEN,
                        color: 'white',
                        '&:hover': { bgcolor: '#1f9a1f' }
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </label>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                    {profileData.name || user?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    {profileData.role}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                    Haz clic en la cámara para cambiar tu foto
                  </Typography>
                </Box>
              </Box>

{/* Solo mostrar campos de perfil para Admin y Coordinador */}
              {user?.role !== 'Participante' && (
                <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Departamento"
                    value={profileData.department}
                    onChange={(e) => handleProfileChange('department', e.target.value)}
                    sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ubicación"
                    value={profileData.location}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Biografía"
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                sx={{
                  bgcolor: GREEN,
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  fontFamily: 'Poppins, sans-serif',
                  '&:hover': { bgcolor: '#1f9a1f' }
                }}
              >
                Guardar Cambios
              </Button>
                </>
              )}

              {/* Mensaje para participantes */}
              {user?.role === 'Participante' && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Como participante, solo puedes cambiar tu foto de perfil.
                </Typography>
              </Box>
              )}
            </CardContent>
          </Card>
        </Grid>


        </Grid>

      {/* Snackbar */}
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

export default SettingsView; 