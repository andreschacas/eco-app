// Servicio para manejar las actividades de los usuarios
class ActivityService {
  constructor() {
    this.ACTIVITY_KEY = 'user_activities';
    this.ACTIVITY_TYPES = {
      // Usuarios
      USER_CREATED: 'user_created',
      USER_UPDATED: 'user_updated',
      USER_DELETED: 'user_deleted',
      USER_ACTIVATED: 'user_activated',
      USER_DEACTIVATED: 'user_deactivated',
      USER_ROLE_CHANGED: 'user_role_changed',
      USER_LOGIN: 'user_login',
      USER_LOGOUT: 'user_logout',
      
      // Proyectos
      PROJECT_CREATED: 'project_created',
      PROJECT_UPDATED: 'project_updated',
      PROJECT_DELETED: 'project_deleted',
      PROJECT_STATUS_CHANGED: 'project_status_changed',
      PROJECT_USER_ASSIGNED: 'project_user_assigned',
      PROJECT_USER_REMOVED: 'project_user_removed',
      
      // Tareas
      TASK_CREATED: 'task_created',
      TASK_UPDATED: 'task_updated',
      TASK_DELETED: 'task_deleted',
      TASK_COMPLETED: 'task_completed',
      TASK_MOVED: 'task_moved',
      TASK_STATUS_CHANGED: 'task_status_changed',
      TASK_PRIORITY_CHANGED: 'task_priority_changed',
      TASK_ASSIGNED: 'task_assigned',
      TASK_UNASSIGNED: 'task_unassigned',
      
      // Notificaciones
      NOTIFICATION_SENT: 'notification_sent',
      NOTIFICATION_READ: 'notification_read',
      
      // Perfil
      PROFILE_UPDATED: 'profile_updated',
      PASSWORD_CHANGED: 'password_changed',
      
      // Sistema
      SYSTEM_LOGIN: 'system_login',
      SYSTEM_ERROR: 'system_error',
      DATA_EXPORTED: 'data_exported',
      DATA_IMPORTED: 'data_imported'
    };
  }

  // Obtener todas las actividades
  getAllActivities() {
    try {
      const activities = localStorage.getItem(this.ACTIVITY_KEY);
      return activities ? JSON.parse(activities) : [];
    } catch (error) {
      console.error('Error loading activities:', error);
      return [];
    }
  }

  // Agregar una nueva actividad
  addActivity(userId, activityType, details = {}) {
    try {
      const activities = this.getAllActivities();
      const newActivity = {
        id: Date.now() + Math.random(),
        userId,
        activityType,
        details,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      activities.unshift(newActivity); // Agregar al inicio
      
      // Mantener solo las últimas 100 actividades para optimizar rendimiento
      if (activities.length > 100) {
        activities.splice(100);
      }

      localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify(activities));
      
      // Emitir evento personalizado para notificar que se agregó una actividad
      window.dispatchEvent(new CustomEvent('activityAdded', { 
        detail: { activity: newActivity } 
      }));
      
      return newActivity;
    } catch (error) {
      console.error('Error adding activity:', error);
      return null;
    }
  }

  // Obtener actividades de un usuario específico
  getUserActivities(userId, limit = 5) {
    const activities = this.getAllActivities();
    return activities
      .filter(activity => activity.userId === userId)
      .slice(0, limit);
  }

  // Obtener la última actividad de un usuario
  getLastUserActivity(userId) {
    const userActivities = this.getUserActivities(userId, 1);
    return userActivities.length > 0 ? userActivities[0] : null;
  }

  // Obtener actividades recientes de todos los usuarios
  getRecentActivities(limit = 10) {
    const activities = this.getAllActivities();
    return activities.slice(0, limit);
  }

  // Limpiar todas las actividades (para desarrollo/testing)
  clearAllActivities() {
    try {
      localStorage.removeItem(this.ACTIVITY_KEY);
      console.log('Todas las actividades han sido eliminadas');
      return true;
    } catch (error) {
      console.error('Error clearing activities:', error);
      return false;
    }
  }

  // Verificar si hay actividades existentes
  hasActivities() {
    const activities = this.getAllActivities();
    return activities.length > 0;
  }

  // Generar descripción de actividad en español
  getActivityDescription(activity) {
    const { activityType, details } = activity;
    
    switch (activityType) {
      // Usuarios
      case this.ACTIVITY_TYPES.USER_CREATED:
        return `Creó un nuevo usuario: "${details.userName || 'Sin nombre'}" (${details.userRole || 'Sin rol'})`;
      
      case this.ACTIVITY_TYPES.USER_UPDATED:
        return `Actualizó el usuario "${details.userName || 'Sin nombre'}"`;
      
      case this.ACTIVITY_TYPES.USER_DELETED:
        return `Eliminó el usuario "${details.userName || 'Sin nombre'}"`;
      
      case this.ACTIVITY_TYPES.USER_ACTIVATED:
        return `Activó el usuario "${details.userName || 'Sin nombre'}"`;
      
      case this.ACTIVITY_TYPES.USER_DEACTIVATED:
        return `Desactivó el usuario "${details.userName || 'Sin nombre'}"`;
      
      case this.ACTIVITY_TYPES.USER_ROLE_CHANGED:
        return `Cambió el rol de "${details.userName || 'Sin nombre'}" de ${details.oldRole || 'N/A'} a ${details.newRole || 'N/A'}`;
      
      case this.ACTIVITY_TYPES.USER_LOGIN:
        return `Inició sesión en el sistema`;
      
      case this.ACTIVITY_TYPES.USER_LOGOUT:
        return `Cerró sesión`;
      
      // Proyectos
      case this.ACTIVITY_TYPES.PROJECT_CREATED:
        return `Creó un nuevo proyecto: "${details.projectName || 'Sin nombre'}"`;
      
      case this.ACTIVITY_TYPES.PROJECT_UPDATED:
        return `Actualizó el proyecto "${details.projectName || 'Sin nombre'}"`;
      
      case this.ACTIVITY_TYPES.PROJECT_DELETED:
        return `Eliminó el proyecto "${details.projectName || 'Sin nombre'}"`;
      
      case this.ACTIVITY_TYPES.PROJECT_STATUS_CHANGED:
        return `Cambió el estado del proyecto "${details.projectName || 'Sin nombre'}" a "${details.newStatus || 'N/A'}"`;
      
      case this.ACTIVITY_TYPES.PROJECT_USER_ASSIGNED:
        return `Asignó a "${details.userName || 'Sin nombre'}" al proyecto "${details.projectName || 'Sin nombre'}"`;
      
      case this.ACTIVITY_TYPES.PROJECT_USER_REMOVED:
        return `Removió a "${details.userName || 'Sin nombre'}" del proyecto "${details.projectName || 'Sin nombre'}"`;
      
      // Tareas
      case this.ACTIVITY_TYPES.TASK_CREATED:
        return `Creó una nueva tarea: "${details.taskTitle || 'Sin título'}"`;
      
      case this.ACTIVITY_TYPES.TASK_UPDATED:
        return `Actualizó la tarea "${details.taskTitle || 'Sin título'}"`;
      
      case this.ACTIVITY_TYPES.TASK_DELETED:
        return `Eliminó la tarea "${details.taskTitle || 'Sin título'}"`;
      
      case this.ACTIVITY_TYPES.TASK_COMPLETED:
        return `Marcó la tarea "${details.taskTitle || 'Sin título'}" como completada`;
      
      case this.ACTIVITY_TYPES.TASK_MOVED:
        return `Movió la tarea "${details.taskTitle || 'Sin título'}" a "${details.newStatus || 'Nueva columna'}"`;
      
      case this.ACTIVITY_TYPES.TASK_STATUS_CHANGED:
        return `Cambió el estado de la tarea "${details.taskTitle || 'Sin título'}" a "${details.newStatus || 'N/A'}"`;
      
      case this.ACTIVITY_TYPES.TASK_PRIORITY_CHANGED:
        return `Cambió la prioridad de la tarea "${details.taskTitle || 'Sin título'}" a "${details.newPriority || 'N/A'}"`;
      
      case this.ACTIVITY_TYPES.TASK_ASSIGNED:
        return `Asignó la tarea "${details.taskTitle || 'Sin título'}" a "${details.userName || 'Sin nombre'}"`;
      
      case this.ACTIVITY_TYPES.TASK_UNASSIGNED:
        return `Desasignó la tarea "${details.taskTitle || 'Sin título'}" de "${details.userName || 'Sin nombre'}"`;
      
      // Notificaciones
      case this.ACTIVITY_TYPES.NOTIFICATION_SENT:
        return `Envió una notificación${details.title ? `: "${details.title}"` : ''}`;
      
      case this.ACTIVITY_TYPES.NOTIFICATION_READ:
        return `Leyó la notificación: "${details.title || 'Sin título'}"`;
      
      // Perfil
      case this.ACTIVITY_TYPES.PROFILE_UPDATED:
        return `Actualizó su perfil`;
      
      case this.ACTIVITY_TYPES.PASSWORD_CHANGED:
        return `Cambió su contraseña`;
      
      // Sistema
      case this.ACTIVITY_TYPES.SYSTEM_LOGIN:
        return `Accedió al sistema`;
      
      case this.ACTIVITY_TYPES.SYSTEM_ERROR:
        return `Error del sistema: "${details.error || 'Error desconocido'}"`;
      
      case this.ACTIVITY_TYPES.DATA_EXPORTED:
        return `Exportó datos del sistema`;
      
      case this.ACTIVITY_TYPES.DATA_IMPORTED:
        return `Importó datos al sistema`;
      
      default:
        return 'Realizó una acción en el sistema';
    }
  }

  // Obtener icono para el tipo de actividad
  getActivityIcon(activityType) {
    switch (activityType) {
      // Usuarios
      case this.ACTIVITY_TYPES.USER_CREATED:
        return '👥';
      case this.ACTIVITY_TYPES.USER_UPDATED:
        return '✏️';
      case this.ACTIVITY_TYPES.USER_DELETED:
        return '🗑️';
      case this.ACTIVITY_TYPES.USER_ACTIVATED:
        return '✅';
      case this.ACTIVITY_TYPES.USER_DEACTIVATED:
        return '❌';
      case this.ACTIVITY_TYPES.USER_ROLE_CHANGED:
        return '🔄';
      case this.ACTIVITY_TYPES.USER_LOGIN:
        return '🔑';
      case this.ACTIVITY_TYPES.USER_LOGOUT:
        return '🚪';
      
      // Proyectos
      case this.ACTIVITY_TYPES.PROJECT_CREATED:
        return '📁';
      case this.ACTIVITY_TYPES.PROJECT_UPDATED:
        return '📝';
      case this.ACTIVITY_TYPES.PROJECT_DELETED:
        return '🗑️';
      case this.ACTIVITY_TYPES.PROJECT_STATUS_CHANGED:
        return '🔄';
      case this.ACTIVITY_TYPES.PROJECT_USER_ASSIGNED:
        return '➕';
      case this.ACTIVITY_TYPES.PROJECT_USER_REMOVED:
        return '➖';
      
      // Tareas
      case this.ACTIVITY_TYPES.TASK_CREATED:
        return '➕';
      case this.ACTIVITY_TYPES.TASK_UPDATED:
        return '✏️';
      case this.ACTIVITY_TYPES.TASK_DELETED:
        return '🗑️';
      case this.ACTIVITY_TYPES.TASK_COMPLETED:
        return '✅';
      case this.ACTIVITY_TYPES.TASK_MOVED:
        return '🔄';
      case this.ACTIVITY_TYPES.TASK_STATUS_CHANGED:
        return '📊';
      case this.ACTIVITY_TYPES.TASK_PRIORITY_CHANGED:
        return '⚡';
      case this.ACTIVITY_TYPES.TASK_ASSIGNED:
        return '👤';
      case this.ACTIVITY_TYPES.TASK_UNASSIGNED:
        return '👤❌';
      
      // Notificaciones
      case this.ACTIVITY_TYPES.NOTIFICATION_SENT:
        return '📢';
      case this.ACTIVITY_TYPES.NOTIFICATION_READ:
        return '👁️';
      
      // Perfil
      case this.ACTIVITY_TYPES.PROFILE_UPDATED:
        return '👤';
      case this.ACTIVITY_TYPES.PASSWORD_CHANGED:
        return '🔒';
      
      // Sistema
      case this.ACTIVITY_TYPES.SYSTEM_LOGIN:
        return '🔑';
      case this.ACTIVITY_TYPES.SYSTEM_ERROR:
        return '⚠️';
      case this.ACTIVITY_TYPES.DATA_EXPORTED:
        return '📤';
      case this.ACTIVITY_TYPES.DATA_IMPORTED:
        return '📥';
      
      default:
        return '🔔';
    }
  }

  // Formatear tiempo relativo
  getRelativeTime(timestamp) {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return activityTime.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  }

}

// Crear instancia singleton
const activityService = new ActivityService();

export default activityService;
