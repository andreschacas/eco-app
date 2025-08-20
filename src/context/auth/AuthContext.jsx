import React, { createContext, useContext, useState, useEffect } from 'react';
import dataService from '../../utils/dataService';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('eco_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const userData = dataService.authenticateUser(email, password);
      if (userData) {
        // No guardamos la contraseña en el localStorage
        const { password: _, ...userWithoutPassword } = userData;
        setUser(userWithoutPassword);
        localStorage.setItem('eco_user', JSON.stringify(userWithoutPassword));
        return { success: true, user: userWithoutPassword };
      } else {
        return { success: false, error: 'Credenciales inválidas' };
      }
    } catch (error) {
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eco_user');
  };

  // Función para actualizar datos del usuario
  const updateUser = (updatedFields) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem('eco_user', JSON.stringify(updatedUser));
  };

  // Función para verificar permisos
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes('all') || user.permissions.includes(permission);
  };

  // Función para verificar rol
  const hasRole = (roleName) => {
    if (!user) return false;
    return user.role === roleName;
  };

  // Función para obtener vista por defecto según rol
  const getDefaultView = () => {
    if (!user) return null;
    switch (user.role) {
      case 'Administrador':
        return 'admin-dashboard';
      case 'Coordinador':
        return 'coordinator-dashboard';
      case 'Participante':
        return 'participant-dashboard';
      default:
        return 'home';
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    hasPermission,
    hasRole,
    getDefaultView,
    isAdmin: user?.role === 'Administrador',
    isCoordinator: user?.role === 'Coordinador',
    isParticipant: user?.role === 'Participante'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 