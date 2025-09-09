// Servicio para manejar las actividades de los usuarios
class ActivityService {
  constructor() {
    this.ACTIVITY_KEY = 'user_activities';
    this.ACTIVITY_TYPES = {
      NOTIFICATION_SENT: 'notification_sent',
      TASK_COMPLETED: 'task_completed',
      TASK_MOVED: 'task_moved',
      PROJECT_CREATED: 'project_created',
      PROFILE_UPDATED: 'profile_updated',
      TASK_CREATED: 'task_created',
      TASK_UPDATED: 'task_updated',
      TASK_DELETED: 'task_deleted',
      PROJECT_UPDATED: 'project_updated'
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
      case this.ACTIVITY_TYPES.NOTIFICATION_SENT:
        return `Envió una notificación${details.title ? `: "${details.title}"` : ''}`;
      
      case this.ACTIVITY_TYPES.TASK_COMPLETED:
        return `Marcó la tarea "${details.taskTitle || 'Sin título'}" como completada`;
      
      case this.ACTIVITY_TYPES.TASK_MOVED:
        return `Movió la tarea "${details.taskTitle || 'Sin título'}" a "${details.newStatus || 'Nueva columna'}"`;
      
      case this.ACTIVITY_TYPES.PROJECT_CREATED:
        return `Creó un nuevo proyecto: "${details.projectName || 'Sin nombre'}"`;
      
      case this.ACTIVITY_TYPES.PROFILE_UPDATED:
        return `Actualizó su perfil`;
      
      case this.ACTIVITY_TYPES.TASK_CREATED:
        return `Creó una nueva tarea: "${details.taskTitle || 'Sin título'}"`;
      
      case this.ACTIVITY_TYPES.TASK_UPDATED:
        return `Actualizó la tarea "${details.taskTitle || 'Sin título'}"`;
      
      case this.ACTIVITY_TYPES.TASK_DELETED:
        return `Eliminó la tarea "${details.taskTitle || 'Sin título'}"`;
      
      case this.ACTIVITY_TYPES.PROJECT_UPDATED:
        return `Actualizó el proyecto "${details.projectName || 'Sin nombre'}"`;
      
      default:
        return 'Realizó una acción en el sistema';
    }
  }

  // Obtener icono para el tipo de actividad
  getActivityIcon(activityType) {
    switch (activityType) {
      case this.ACTIVITY_TYPES.NOTIFICATION_SENT:
        return '📢';
      case this.ACTIVITY_TYPES.TASK_COMPLETED:
        return '✅';
      case this.ACTIVITY_TYPES.TASK_MOVED:
        return '🔄';
      case this.ACTIVITY_TYPES.PROJECT_CREATED:
        return '📁';
      case this.ACTIVITY_TYPES.PROFILE_UPDATED:
        return '👤';
      case this.ACTIVITY_TYPES.TASK_CREATED:
        return '➕';
      case this.ACTIVITY_TYPES.TASK_UPDATED:
        return '✏️';
      case this.ACTIVITY_TYPES.TASK_DELETED:
        return '🗑️';
      case this.ACTIVITY_TYPES.PROJECT_UPDATED:
        return '📝';
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
