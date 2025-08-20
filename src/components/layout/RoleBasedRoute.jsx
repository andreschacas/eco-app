import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useAuth } from '../../context/auth/AuthContext';

/**
 * Componente para proteger rutas basadas en roles
 * @param {Object} props
 * @param {Array} props.allowedRoles - Roles permitidos para acceder al componente
 * @param {React.Component} props.children - Componente a renderizar si el usuario tiene permisos
 * @param {string} props.fallbackMessage - Mensaje a mostrar si no tiene permisos
 */
const RoleBasedRoute = ({ 
  allowedRoles = [], 
  children, 
  fallbackMessage = 'No tienes permisos para acceder a esta sección' 
}) => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning">
          Debes iniciar sesión para acceder a esta sección
        </Alert>
      </Box>
    );
  }

  // Verificar si el usuario tiene al menos uno de los roles permitidos
  const hasPermission = allowedRoles.length === 0 || allowedRoles.some(role => hasRole(role));

  if (!hasPermission) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {fallbackMessage}
        </Alert>
        <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
          Tu rol actual: <strong>{user.role}</strong>
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
          Roles requeridos: <strong>{allowedRoles.join(', ')}</strong>
        </Typography>
      </Box>
    );
  }

  return children;
};

export default RoleBasedRoute;
