import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Divider from '@mui/material/Divider';
import logo from '../assets/eco-logo-pro.png';
import { useAuth } from '../context/auth/AuthContext';

const GREEN = '#2AAC26';

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error);
      }
      // Si es exitoso, el usuario será redirigido automáticamente
    } catch (err) {
      setError('Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Función para demo con credenciales predefinidas
  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    setLoading(true);
    setError('');
    
    try {
      const result = await login(demoEmail, demoPassword);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      {/* Panel izquierdo */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 4, bgcolor: '#f8f9fa' }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <img src={logo} alt="Logo" style={{ width: 32, height: 32, marginRight: 10 }} />
            <span style={{ fontWeight: 700, color: '#111', fontSize: 22, fontFamily: 'Poppins, sans-serif', letterSpacing: 0.5 }}>ECO</span>
          </Box>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', bgcolor: '#fff' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke={GREEN} strokeWidth="2"/><path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" stroke={GREEN} strokeWidth="2"/></svg>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontFamily: 'Poppins, sans-serif' }}>Inicia sesión</Typography>
              <Typography variant="body2" sx={{ color: '#888', mb: 2, fontFamily: 'Poppins, sans-serif' }}>
                Ingresa tus datos para ingresar.
              </Typography>
            </Box>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ mb: 1, textTransform: 'none', borderColor: '#e0e0e0', color: '#222', fontWeight: 600, fontFamily: 'Poppins, sans-serif', '&:hover': { borderColor: GREEN, bgcolor: '#e8f5e9' } }} 
              onClick={() => handleDemoLogin('admin@eco.com', 'admin123')}
              disabled={loading}
            >
              Demo Administrador
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ mb: 1, textTransform: 'none', borderColor: '#e0e0e0', color: '#222', fontWeight: 600, fontFamily: 'Poppins, sans-serif', '&:hover': { borderColor: GREEN, bgcolor: '#e8f5e9' } }} 
              onClick={() => handleDemoLogin('coordinator@eco.com', 'coord123')}
              disabled={loading}
            >
              Demo Coordinador
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ mb: 2, textTransform: 'none', borderColor: '#e0e0e0', color: '#222', fontWeight: 600, fontFamily: 'Poppins, sans-serif', '&:hover': { borderColor: GREEN, bgcolor: '#e8f5e9' } }} 
              onClick={() => handleDemoLogin('participant@eco.com', 'part123')}
              disabled={loading}
            >
              Demo Participante
            </Button>
            <Divider sx={{ my: 2, color: '#e0e0e0' }}>o</Divider>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Correo electrónico"
                variant="outlined"
                size="small"
                sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                required
                InputProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
              />
              <TextField
                fullWidth
                label="Contraseña"
                variant="outlined"
                size="small"
                type={showPassword ? 'text' : 'password'}
                sx={{ mb: 1, fontFamily: 'Poppins, sans-serif' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowPassword(v => !v)} 
                        edge="end" 
                        size="small"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  style: { fontFamily: 'Poppins, sans-serif' }
                }}
              />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <FormControlLabel
                control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} sx={{ color: GREEN }} />}
                label={<span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14 }}>Recordar</span>}
              />
              <Button variant="text" sx={{ color: '#888', fontSize: 14, textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}>
                ¿Olvidaste tu contraseña?
              </Button>
            </Box>
              <Button 
                fullWidth 
                type="submit"
                variant="contained" 
                sx={{ 
                  bgcolor: GREEN, 
                  color: '#fff', 
                  fontWeight: 600, 
                  fontFamily: 'Poppins, sans-serif', 
                  textTransform: 'none', 
                  borderRadius: 2, 
                  boxShadow: 'none', 
                  height: 40, 
                  ':hover': { bgcolor: '#1f9a1f' },
                  ':disabled': { bgcolor: '#ccc' }
                }} 
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Ingresar'}
              </Button>
            </form>
          </Paper>
        </Box>
      </Box>
      {/* Panel derecho con imagen de fondo */}
      <Box sx={{ 
        flex: 1, 
        minHeight: '100vh', 
        background: `linear-gradient(135deg, ${GREEN} 0%, #1f9a1f 100%)`,
        backgroundImage: 'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${GREEN}cc 0%, #1f9a1fcc 100%)`,
          zIndex: 1
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', px: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            Bienvenido a ECO
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, fontFamily: 'Poppins, sans-serif' }}>
            Gestiona tus proyectos sostenibles de manera eficiente
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Auth; 