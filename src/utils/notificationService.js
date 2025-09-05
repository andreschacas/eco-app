// Servicio para manejar notificaciones del sistema
class NotificationService {
  constructor() {
    this.storageKey = 'kanban_notifications';
  }

  // Obtener todas las notificaciones
  getAll() {
    try {
      const notifications = localStorage.getItem(this.storageKey);
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return [];
    }
  }

  // Crear una nueva notificación
  create(notification) {
    try {
      const notifications = this.getAll();
      const newNotification = {
        id: Date.now() + Math.random(),
        ...notification,
        created_at: new Date().toISOString(),
        read: false
      };
      
      notifications.unshift(newNotification);
      this.save(notifications);
      return newNotification;
    } catch (error) {
      console.error('Error al crear notificación:', error);
      return null;
    }
  }

  // Marcar notificación como leída
  markAsRead(notificationId) {
    try {
      const notifications = this.getAll();
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      );
      this.save(updatedNotifications);
      return true;
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      return false;
    }
  }

  // Marcar todas las notificaciones como leídas
  markAllAsRead() {
    try {
      const notifications = this.getAll();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      this.save(updatedNotifications);
      return true;
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      return false;
    }
  }

  // Eliminar notificación
  delete(notificationId) {
    try {
      const notifications = this.getAll();
      const updatedNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );
      this.save(updatedNotifications);
      return true;
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      return false;
    }
  }

  // Eliminar todas las notificaciones
  deleteAll() {
    try {
      this.save([]);
      return true;
    } catch (error) {
      console.error('Error al eliminar todas las notificaciones:', error);
      return false;
    }
  }

  // Obtener notificaciones no leídas
  getUnread() {
    try {
      const notifications = this.getAll();
      return notifications.filter(notification => !notification.read);
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas:', error);
      return [];
    }
  }

  // Obtener notificaciones no leídas de un usuario específico
  getUnreadByUser(userId) {
    try {
      const notifications = this.getAll();
      return notifications.filter(notification => 
        notification.user_id === userId && !notification.read
      );
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas del usuario:', error);
      return [];
    }
  }

  // Obtener contador de notificaciones no leídas
  getUnreadCount() {
    return this.getUnread().length;
  }

  // Obtener contador de notificaciones no leídas de un usuario específico
  getUnreadCountByUser(userId) {
    return this.getUnreadByUser(userId).length;
  }

  // Guardar notificaciones en localStorage
  save(notifications) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error al guardar notificaciones:', error);
    }
  }

  // Enviar notificación a usuarios específicos
  sendToUsers(userIds, notification) {
    try {
      const notifications = this.getAll();
      const newNotifications = userIds.map(userId => ({
        id: Date.now() + Math.random() + userId,
        ...notification,
        user_id: userId,
        created_at: new Date().toISOString(),
        read: false
      }));
      
      notifications.unshift(...newNotifications);
      this.save(notifications);
      return newNotifications;
    } catch (error) {
      console.error('Error al enviar notificaciones a usuarios:', error);
      return [];
    }
  }

  // Enviar notificación a todos los usuarios de un proyecto
  sendToProject(projectId, notification) {
    try {
      // Obtener usuarios del proyecto desde dataService
      const dataService = require('./dataService');
      const projects = dataService.getAll('projects');
      const project = projects.find(p => p.id === projectId);
      
      if (!project) {
        console.error('Proyecto no encontrado:', projectId);
        return [];
      }

      // Obtener todos los usuarios asignados al proyecto
      const userIds = [...new Set([
        ...project.assigned_users,
        ...project.coordinators
      ])];

      return this.sendToUsers(userIds, {
        ...notification,
        project_id: projectId,
        project_name: project.name
      });
    } catch (error) {
      console.error('Error al enviar notificación al proyecto:', error);
      return [];
    }
  }

  // Crear notificaciones de ejemplo
  createSampleNotifications() {
    // Verificar si ya existen notificaciones para evitar duplicados
    const existingNotifications = this.getAll();
    if (existingNotifications.length > 0) {
      return;
    }

    const sampleNotifications = [
      {
        type: 'task_assigned',
        title: 'Nueva tarea asignada',
        message: 'Se te ha asignado la tarea "Finalizar presupuesto del evento"',
        project_id: 1,
        project_name: 'Evento de Sostenibilidad',
        user_id: 3,
        priority: 'high',
        sender_name: 'Ana García'
      },
      {
        type: 'task_completed',
        title: 'Tarea completada',
        message: 'La tarea "Finalizar nombre del evento" ha sido completada',
        project_id: 1,
        project_name: 'Evento de Sostenibilidad',
        user_id: 4,
        priority: 'normal',
        sender_name: 'Carlos Rodríguez'
      },
      {
        type: 'project_update',
        title: 'Actualización del proyecto',
        message: 'El proyecto "Monitoreo Ambiental" ha sido actualizado con nuevas métricas',
        project_id: 2,
        project_name: 'Monitoreo Ambiental',
        user_id: 3,
        priority: 'normal',
        sender_name: 'María López'
      },
      {
        type: 'deadline_approaching',
        title: 'Fecha límite próxima',
        message: 'La tarea "Reclutar tres oradores" vence en 2 días',
        project_id: 1,
        project_name: 'Evento de Sostenibilidad',
        user_id: 4,
        priority: 'urgent',
        sender_name: 'Sistema'
      },
      {
        type: 'general',
        title: 'Reunión de equipo',
        message: 'Reunión de seguimiento programada para mañana a las 10:00 AM',
        project_id: 1,
        project_name: 'Evento de Sostenibilidad',
        user_id: 3,
        priority: 'normal',
        sender_name: 'Laura Fernández'
      },
      {
        type: 'task_assigned',
        title: 'Tarea urgente asignada',
        message: 'Se requiere tu atención inmediata en "Análisis de Emisiones CO2"',
        project_id: 2,
        project_name: 'Monitoreo Ambiental',
        user_id: 4,
        priority: 'urgent',
        sender_name: 'Ana García'
      }
    ];

    sampleNotifications.forEach(notification => {
      this.create(notification);
    });
  }
}

export default new NotificationService();
