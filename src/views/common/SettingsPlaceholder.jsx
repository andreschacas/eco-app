import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth } from '../../context/auth/AuthContext';

const GREEN = '#2AAC26';

const SettingsPlaceholder = ({ onNavigate }) => {
  const { user, getDefaultView } = useAuth();

  const handleGoBack = () => {
    const defaultView = getDefaultView();
    onNavigate(defaultView);
  };

  const settingsOptions = [
    {
      title: 'Perfil de Usuario',
      description: 'Actualiza tu información personal y foto de perfil',
      icon: <Avatar sx={{ bgcolor: `${GREEN}20`, color: GREEN, width: 40, height: 40 }}>{user?.name?.[0]}</Avatar>,
      comingSoon: true
    },
    {
      title: 'Notificaciones',
      description: 'Configura cómo y cuándo recibir notificaciones',
      icon: <NotificationsIcon sx={{ fontSize: 32, color: '#ff9800' }} />,
      comingSoon: true
    },
    {
      title: 'Seguridad y Privacidad',
      description: 'Gestiona tu contraseña y configuraciones de privacidad',
      icon: <SecurityIcon sx={{ fontSize: 32, color: '#f44336' }} />,
      comingSoon: true
    },
    {
      title: 'Apariencia',
      description: 'Personaliza el tema y la apariencia de la aplicación',
      icon: <PaletteIcon sx={{ fontSize: 32, color: '#9c27b0' }} />,
      comingSoon: true
    },
    {
      title: 'Idioma y Región',
      description: 'Configura tu idioma preferido y formato de fecha',
      icon: <LanguageIcon sx={{ fontSize: 32, color: '#2196f3' }} />,
      comingSoon: true
    }
  ];

  return (
    <Box sx={{ p: 3, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={handleGoBack}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
            Configuración
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            Personaliza tu experiencia en ECO
          </Typography>
        </Box>
      </Box>

      {/* User Info Card */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar 
              src={user?.avatar} 
              alt={user?.name}
              sx={{ width: 80, height: 80 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                {user?.name}
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 0.5 }}>
                {user?.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  px: 2, 
                  py: 0.5, 
                  borderRadius: 1, 
                  bgcolor: `${GREEN}20`, 
                  color: GREEN,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {user?.role}
                </Box>
                <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                  {user?.position}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Development Notice */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '2px solid #e3f2fd' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <SettingsIcon sx={{ fontSize: 64, color: '#2196f3', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif', mb: 2, color: '#2196f3' }}>
            Configuración en Desarrollo
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 1 }}>
            Esta sección está siendo desarrollada para ofrecerte la mejor experiencia de personalización.
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
            Las siguientes opciones estarán disponibles próximamente:
          </Typography>
        </CardContent>
      </Card>

      {/* Settings Options */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {settingsOptions.map((option, index) => (
          <Card 
            key={index}
            sx={{ 
              borderRadius: 3, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
              },
              opacity: option.comingSoon ? 0.7 : 1
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  bgcolor: '#f8f9fa'
                }}>
                  {option.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      {option.title}
                    </Typography>
                    {option.comingSoon && (
                      <Box sx={{ 
                        px: 1, 
                        py: 0.25, 
                        borderRadius: 0.5, 
                        bgcolor: '#ff980020', 
                        color: '#ff9800',
                        fontSize: '10px',
                        fontWeight: 600,
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        PRÓXIMAMENTE
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 2 }}>
                    {option.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={option.comingSoon}
                    sx={{
                      borderColor: option.comingSoon ? '#ddd' : GREEN,
                      color: option.comingSoon ? '#999' : GREEN,
                      textTransform: 'none',
                      fontFamily: 'Poppins, sans-serif',
                      '&:hover': !option.comingSoon ? { 
                        borderColor: '#1f9a1f', 
                        bgcolor: '#e8f5e9' 
                      } : {}
                    }}
                  >
                    {option.comingSoon ? 'En desarrollo' : 'Configurar'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Footer */}
      <Card sx={{ mt: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: '#f8f9fa' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            ¿Necesitas ayuda con la configuración? Visita nuestra sección de{' '}
            <Button 
              variant="text" 
              size="small"
              onClick={() => onNavigate('help')}
              sx={{ 
                color: GREEN, 
                textTransform: 'none', 
                fontFamily: 'Poppins, sans-serif',
                textDecoration: 'underline',
                p: 0,
                minWidth: 'auto'
              }}
            >
              Ayuda
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPlaceholder;
