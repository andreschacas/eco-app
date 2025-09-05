// Sistema de gestión de datos con localStorage para ECO - Sistema de Proyectos de Energía y Cambio Climático

const STORAGE_KEYS = {
  USERS: 'eco_users',
  PROJECTS: 'eco_projects',
  TASKS: 'eco_tasks',
  METRICS: 'eco_metrics',
  ROLES: 'eco_roles',
  POSITIONS: 'eco_positions',
  PROJECT_USERS: 'eco_project_users',
  TASK_ASSIGNMENTS: 'eco_task_assignments',
  METRIC_TYPES: 'eco_metric_types',
  METRIC_HISTORY: 'eco_metric_history',
  COMMENTS: 'eco_comments',
  ATTACHMENTS: 'eco_attachments'
};

// Datos iniciales del sistema
const INITIAL_DATA = {
  roles: [
    { id: 1, name: 'Administrador', permissions: ['all'] },
    { id: 2, name: 'Coordinador', permissions: ['manage_projects', 'manage_tasks', 'view_metrics'] },
    { id: 3, name: 'Participante', permissions: ['view_tasks', 'update_task_status'] }
  ],
  
  positions: [
    { id: 1, name: 'Director Ejecutivo' },
    { id: 2, name: 'Coordinador de Proyectos' },
    { id: 3, name: 'Especialista en Energía' },
    { id: 4, name: 'Analista Ambiental' },
    { id: 5, name: 'Investigador' },
    { id: 6, name: 'Consultor' }
  ],

  users: [
    {
      id: 1,
      name: 'Andrea Rodríguez',
      email: 'admin@eco.com',
      password: 'admin123',
      role_id: 1,
      position_id: 1,
      avatar: 'https://i.pravatar.cc/150?img=1',
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      email: 'coordinator@eco.com',
      password: 'coord123',
      role_id: 2,
      position_id: 2,
      avatar: 'https://i.pravatar.cc/150?img=2',
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Elena Silva',
      email: 'participant@eco.com',
      password: 'part123',
      role_id: 3,
      position_id: 3,
      avatar: 'https://i.pravatar.cc/150?img=3',
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Miguel Torres',
      email: 'miguel@eco.com',
      password: 'miguel123',
      role_id: 3,
      position_id: 4,
      avatar: 'https://i.pravatar.cc/150?img=4',
      active: true,
      created_at: new Date().toISOString()
    }
  ],

  projects: [
    {
      id: 1,
      name: 'Tesis Huella de Carbono',
      description: 'Investigación sobre la huella de carbono en procesos industriales',
      start_date: '2025-01-15',
      end_date: '2025-12-15',
      status: 'En progreso',
      creator_id: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Pared Verde Sustentable',
      description: 'Implementación de muros verdes para reducir la temperatura urbana',
      start_date: '2025-02-01',
      end_date: '2025-11-30',
      status: 'En progreso',
      creator_id: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Tesis Huella Hídrica',
      description: 'Análisis del consumo de agua en la agricultura local',
      start_date: '2025-03-01',
      end_date: '2025-02-28',
      status: 'Planificación',
      creator_id: 2,
      created_at: new Date().toISOString()
    }
  ],

  metricTypes: [
    { id: 1, name: 'Emisiones CO2', unit: 'toneladas', category: 'Carbono' },
    { id: 2, name: 'Consumo Energético', unit: 'kWh', category: 'Energía' },
    { id: 3, name: 'Consumo de Agua', unit: 'litros', category: 'Agua' },
    { id: 4, name: 'Residuos Generados', unit: 'kg', category: 'Residuos' },
    { id: 5, name: 'Área Verde', unit: 'm²', category: 'Biodiversidad' }
  ],

  metrics: [
    // Métricas para Proyecto 1: Tesis Huella de Carbono
    {
      id: 1,
      name: 'Reducción de Emisiones CO2',
      project_id: 1,
      metric_type_id: 1,
      unit: 'kg CO2',
      target_value: 1200,
      current_value: 340,
      description: 'Meta de reducción de emisiones de carbono del proyecto',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Eficiencia Energética',
      project_id: 1,
      metric_type_id: 2,
      unit: 'kWh',
      target_value: 5000,
      current_value: 1850,
      description: 'Ahorro energético esperado del proyecto',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Presupuesto Utilizado',
      project_id: 1,
      metric_type_id: null,
      unit: '€',
      target_value: 15000,
      current_value: 8500,
      description: 'Presupuesto ejecutado vs presupuesto total',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Progreso del Proyecto',
      project_id: 1,
      metric_type_id: null,
      unit: '%',
      target_value: 100,
      current_value: 65,
      description: 'Porcentaje de avance del proyecto',
      created_at: new Date().toISOString()
    },
    
    // Métricas para Proyecto 2: Pared Verde Sustentable
    {
      id: 5,
      name: 'Absorción de CO2',
      project_id: 2,
      metric_type_id: 1,
      unit: 'kg CO2',
      target_value: 800,
      current_value: 0,
      description: 'CO2 absorbido por las plantas instaladas',
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Consumo Eléctrico',
      project_id: 2,
      metric_type_id: 2,
      unit: 'kWh',
      target_value: 2000,
      current_value: 0,
      description: 'Consumo energético del sistema de riego',
      created_at: new Date().toISOString()
    },
    {
      id: 7,
      name: 'Inversión Total',
      project_id: 2,
      metric_type_id: null,
      unit: '€',
      target_value: 25000,
      current_value: 3200,
      description: 'Inversión total en la pared verde',
      created_at: new Date().toISOString()
    },
    {
      id: 8,
      name: 'Avance de Implementación',
      project_id: 2,
      metric_type_id: null,
      unit: '%',
      target_value: 100,
      current_value: 15,
      description: 'Porcentaje de implementación de la pared verde',
      created_at: new Date().toISOString()
    },
    
    // Métricas para Proyecto 3: Tesis Huella Hídrica
    {
      id: 9,
      name: 'Reducción Consumo Agua',
      project_id: 3,
      metric_type_id: 3,
      unit: 'kg CO2',
      target_value: 500,
      current_value: 0,
      description: 'Reducción indirecta de CO2 por ahorro de agua',
      created_at: new Date().toISOString()
    },
    {
      id: 10,
      name: 'Análisis de Muestras',
      project_id: 3,
      metric_type_id: 2,
      unit: 'kWh',
      target_value: 1500,
      current_value: 0,
      description: 'Consumo energético del laboratorio de análisis',
      created_at: new Date().toISOString()
    },
    {
      id: 11,
      name: 'Costo de Investigación',
      project_id: 3,
      metric_type_id: null,
      unit: '€',
      target_value: 12000,
      current_value: 1800,
      description: 'Presupuesto destinado a la investigación',
      created_at: new Date().toISOString()
    },
    {
      id: 12,
      name: 'Progreso de Análisis',
      project_id: 3,
      metric_type_id: null,
      unit: '%',
      target_value: 100,
      current_value: 8,
      description: 'Porcentaje de análisis hídrico completado',
      created_at: new Date().toISOString()
    }
  ],

  tasks: [
    // Tareas de ejemplo basadas en la imagen de referencia
    {
      id: 1,
      title: 'Finalizar nombre del evento',
      description: 'Definir y aprobar el nombre final para el evento de sostenibilidad',
      status: 'Completada',
      priority: 'Alta',
      due_date: '2025-01-15',
      project_id: 1,
      assigned_users: [3],
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Finalizar presupuesto del evento',
      description: 'Completar el presupuesto detallado para todas las actividades del evento',
      status: 'En progreso',
      priority: 'Crítica',
      due_date: '2025-01-20',
      project_id: 1,
      assigned_users: [4],
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Proponer 3 ideas de keynote para conferencia',
      description: 'Desarrollar y presentar tres propuestas de temas principales para la conferencia',
      status: 'En progreso',
      priority: 'Alta',
      due_date: '2025-01-25',
      project_id: 1,
      assigned_users: [3],
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Reclutar tres oradores para conferencia',
      description: 'Identificar y contactar tres oradores expertos en sostenibilidad',
      status: 'Pendiente',
      priority: 'Alta',
      due_date: '2025-02-05',
      project_id: 1,
      assigned_users: [4],
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      title: 'Contactar oradores invitados potenciales',
      description: 'Llegar a oradores invitados potenciales para el evento',
      status: 'Pendiente',
      priority: 'Media',
      due_date: '2025-01-30',
      project_id: 1,
      assigned_users: [3],
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      title: 'Mapear estrategia de sesiones de trabajo',
      description: 'Desarrollar la estrategia detallada para las sesiones de trabajo del evento',
      status: 'Pendiente',
      priority: 'Media',
      due_date: '2025-02-10',
      project_id: 1,
      assigned_users: [4],
      created_at: new Date().toISOString()
    },
    {
      id: 7,
      title: 'Asegurar panel de oradores',
      description: 'Confirmar la participación de todos los oradores del panel principal',
      status: 'Pendiente',
      priority: 'Alta',
      due_date: '2025-02-15',
      project_id: 1,
      assigned_users: [3],
      created_at: new Date().toISOString()
    },
    {
      id: 8,
      title: 'Programar sesiones de trabajo',
      description: 'Organizar y programar todas las sesiones de trabajo del evento',
      status: 'En progreso',
      priority: 'Media',
      due_date: '2025-01-25',
      project_id: 1,
      assigned_users: [4],
      created_at: new Date().toISOString()
    },
    {
      id: 9,
      title: 'Explorar ideas de tema del evento',
      description: 'Investigar y desarrollar ideas creativas para el tema principal del evento',
      status: 'Pendiente',
      priority: 'Media',
      due_date: '2025-02-25',
      project_id: 1,
      assigned_users: [3],
      created_at: new Date().toISOString()
    },
    {
      id: 10,
      title: 'Programar evento principal',
      description: 'Coordinar y programar el evento principal de sostenibilidad',
      status: 'Completada',
      priority: 'Alta',
      due_date: '2025-03-01',
      project_id: 1,
      assigned_users: [4],
      created_at: new Date().toISOString()
    },
    {
      id: 11,
      title: 'Diseñar logo y marca del evento',
      description: 'Crear el diseño del logo y elementos de marca para el evento',
      status: 'Pendiente',
      priority: 'Media',
      due_date: '2025-02-15',
      project_id: 1,
      assigned_users: [3],
      created_at: new Date().toISOString()
    },
    {
      id: 12,
      title: 'Finalizar agenda del evento',
      description: 'Completar y aprobar la agenda final del evento de sostenibilidad',
      status: 'Pendiente',
      priority: 'Alta',
      due_date: '2025-02-15',
      project_id: 1,
      assigned_users: [4],
      created_at: new Date().toISOString()
    },
    {
      id: 13,
      title: 'Finalizar agenda de sesiones',
      description: 'Completar la agenda detallada para todas las sesiones del evento',
      status: 'Pendiente',
      priority: 'Media',
      due_date: '2025-03-15',
      project_id: 1,
      assigned_users: [3],
      created_at: new Date().toISOString()
    },
    // Tareas adicionales para otros proyectos
    {
      id: 14,
      title: 'Análisis de Emisiones CO2',
      description: 'Realizar medición y análisis de las emisiones de carbono del proyecto',
      status: 'En progreso',
      priority: 'Alta',
      due_date: '2025-03-20',
      project_id: 2,
      assigned_users: [3, 4],
      created_at: new Date().toISOString()
    },
    {
      id: 15,
      title: 'Instalación de Sensores',
      description: 'Colocar sensores de monitoreo ambiental en las ubicaciones designadas',
      status: 'Pendiente',
      priority: 'Media',
      due_date: '2025-03-25',
      project_id: 2,
      assigned_users: [3],
      created_at: new Date().toISOString()
    },
    {
      id: 16,
      title: 'Diseño de Pared Verde',
      description: 'Crear diseño arquitectónico para la implementación del muro verde',
      status: 'En progreso',
      priority: 'Alta',
      due_date: '2025-04-01',
      project_id: 2,
      assigned_users: [3],
      created_at: new Date().toISOString()
    },
    {
      id: 17,
      title: 'Selección de Plantas',
      description: 'Investigar y seleccionar especies de plantas adecuadas para el clima local',
      status: 'Pendiente',
      priority: 'Media',
      due_date: '2025-04-05',
      project_id: 2,
      assigned_users: [4],
      created_at: new Date().toISOString()
    },
    {
      id: 18,
      title: 'Análisis de Consumo Hídrico',
      description: 'Estudiar patrones de consumo de agua en la región',
      status: 'Pendiente',
      priority: 'Crítica',
      due_date: '2025-02-25',
      project_id: 3,
      assigned_users: [3, 4],
      created_at: new Date().toISOString()
    },
    {
      id: 19,
      title: 'Documentación Técnica',
      description: 'Crear documentación técnica completa del sistema',
      status: 'Completada',
      priority: 'Media',
      due_date: '2025-03-01',
      project_id: 3,
      assigned_users: [4],
      created_at: new Date().toISOString()
    }
  ],

  projectUsers: [
    { id: 1, project_id: 1, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 2, project_id: 1, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 3, project_id: 2, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 4, project_id: 2, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 5, project_id: 3, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 6, project_id: 3, user_id: 4, assigned_at: new Date().toISOString() }
  ],

  taskAssignments: [
    // Asignaciones para las nuevas tareas de ejemplo
    { id: 1, task_id: 1, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 2, task_id: 2, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 3, task_id: 3, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 4, task_id: 4, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 5, task_id: 5, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 6, task_id: 6, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 7, task_id: 7, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 8, task_id: 8, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 9, task_id: 9, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 10, task_id: 10, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 11, task_id: 11, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 12, task_id: 12, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 13, task_id: 13, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 14, task_id: 14, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 15, task_id: 14, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 16, task_id: 15, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 17, task_id: 16, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 18, task_id: 17, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 19, task_id: 18, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 20, task_id: 18, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 21, task_id: 19, user_id: 4, assigned_at: new Date().toISOString() }
  ],

  comments: [
    // Los comentarios se crearán dinámicamente por los usuarios
  ],

  attachments: [
    // Los adjuntos se crearán dinámicamente por los usuarios
  ]
};

// Clase principal para gestión de datos
class DataService {
  constructor() {
    this.initializeData();
  }

  // Inicializar datos si no existen
  initializeData() {
    Object.keys(INITIAL_DATA).forEach(key => {
      const storageKey = STORAGE_KEYS[key.toUpperCase()] || `eco_${key}`;
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify(INITIAL_DATA[key]));
      }
    });
    
    // Asegurar que las claves de datos adicionales existan
    if (!localStorage.getItem(STORAGE_KEYS.PROJECT_USERS)) {
      localStorage.setItem(STORAGE_KEYS.PROJECT_USERS, JSON.stringify(INITIAL_DATA.projectUsers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASK_ASSIGNMENTS)) {
      localStorage.setItem(STORAGE_KEYS.TASK_ASSIGNMENTS, JSON.stringify(INITIAL_DATA.taskAssignments));
    }
    if (!localStorage.getItem(STORAGE_KEYS.METRICS)) {
      localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(INITIAL_DATA.metrics));
    }
    
    // Inicializar notificaciones de ejemplo
    try {
      const notificationService = require('./notificationService').default;
      notificationService.createSampleNotifications();
    } catch (error) {
      // Silencioso - las notificaciones son opcionales
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_DATA.comments));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTACHMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ATTACHMENTS, JSON.stringify(INITIAL_DATA.attachments));
    }
  }

  // Métodos genéricos para CRUD
  getAll(entity) {
    const key = STORAGE_KEYS[entity.toUpperCase()];
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  getById(entity, id) {
    const items = this.getAll(entity);
    return items.find(item => item.id === parseInt(id));
  }

  create(entity, data) {
    const items = this.getAll(entity);
    const newItem = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    items.push(newItem);
    this.saveAll(entity, items);
    return newItem;
  }

  update(entity, id, data) {
    const items = this.getAll(entity);
    const index = items.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      items[index] = { ...items[index], ...data, updated_at: new Date().toISOString() };
      this.saveAll(entity, items);
      return items[index];
    }
    return null;
  }

  delete(entity, id) {
    const items = this.getAll(entity);
    const filteredItems = items.filter(item => item.id !== parseInt(id));
    this.saveAll(entity, filteredItems);
    return true;
  }

  saveAll(entity, data) {
    const key = STORAGE_KEYS[entity.toUpperCase()];
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Métodos específicos para usuarios
  getUserByEmail(email) {
    const users = this.getAll('users');
    return users.find(user => user.email === email && user.active);
  }

  getUserById(id) {
    const users = this.getAll('users');
    return users.find(user => user.id === id && user.active);
  }

  authenticateUser(email, password) {
    const user = this.getUserByEmail(email);
    if (user && user.password === password) {
      const role = this.getById('roles', user.role_id);
      const position = this.getById('positions', user.position_id);
      return {
        ...user,
        role: role.name,
        position: position.name,
        permissions: role.permissions
      };
    }
    return null;
  }

  // Métodos específicos para proyectos
  getProjectsByCoordinator(coordinatorId) {
    const projects = this.getAll('projects');
    const projectUsers = this.getAll('project_users');
    
    return projects.filter(project => {
      const isCreator = project.creator_id === coordinatorId;
      const isAssigned = projectUsers.some(pu => 
        pu.project_id === project.id && pu.user_id === coordinatorId
      );
      return isCreator || isAssigned;
    });
  }

  getProjectParticipants(projectId) {
    const projectUsers = this.getAll('project_users');
    const users = this.getAll('users');
    
    const participantIds = projectUsers
      .filter(pu => pu.project_id === parseInt(projectId))
      .map(pu => pu.user_id);
    
    return users.filter(user => participantIds.includes(user.id));
  }

  addUserToProject(projectId, userId) {
    const projectUsers = this.getAll('project_users');
    const exists = projectUsers.some(pu => 
      pu.project_id === parseInt(projectId) && pu.user_id === parseInt(userId)
    );
    
    if (!exists) {
      const newAssignment = {
        id: Date.now(),
        project_id: parseInt(projectId),
        user_id: parseInt(userId),
        assigned_at: new Date().toISOString()
      };
      projectUsers.push(newAssignment);
      this.saveAll('project_users', projectUsers);
      return newAssignment;
    }
    return null;
  }

  removeUserFromProject(projectId, userId) {
    const projectUsers = this.getAll('project_users');
    const filteredProjectUsers = projectUsers.filter(pu => 
      !(pu.project_id === parseInt(projectId) && pu.user_id === parseInt(userId))
    );
    
    if (filteredProjectUsers.length < projectUsers.length) {
      this.saveAll('project_users', filteredProjectUsers);
      return true;
    }
    return false;
  }

  // Métodos específicos para tareas
  getTasksByProject(projectId) {
    const tasks = this.getAll('tasks');
    return tasks.filter(task => task.project_id === parseInt(projectId));
  }

  getTasksByUser(userId) {
    const tasks = this.getAll('tasks');
    const assignments = this.getAll('task_assignments');
    
    const assignedTaskIds = assignments
      .filter(assignment => assignment.user_id === parseInt(userId))
      .map(assignment => assignment.task_id);
    
    return tasks.filter(task => assignedTaskIds.includes(task.id));
  }

  assignTaskToUser(taskId, userId) {
    const assignments = this.getAll('task_assignments');
    const exists = assignments.some(assignment => 
      assignment.task_id === parseInt(taskId) && assignment.user_id === parseInt(userId)
    );
    
    if (!exists) {
      const newAssignment = {
        id: Date.now(),
        task_id: parseInt(taskId),
        user_id: parseInt(userId),
        assigned_at: new Date().toISOString()
      };
      assignments.push(newAssignment);
      this.saveAll('task_assignments', assignments);
      return newAssignment;
    }
    return null;
  }

  // Métodos específicos para métricas
  getProjectMetrics(projectId) {
    const metrics = this.getAll('metrics');
    return metrics.filter(metric => metric.project_id === parseInt(projectId));
  }

  updateMetricValue(metricId, newValue) {
    const metric = this.getById('metrics', metricId);
    if (metric) {
      // Guardar en historial
      const history = this.getAll('metric_history');
      history.push({
        id: Date.now(),
        metric_id: parseInt(metricId),
        value: newValue,
        recorded_at: new Date().toISOString()
      });
      this.saveAll('metric_history', history);
      
      // Actualizar valor actual
      return this.update('metrics', metricId, { current_value: newValue });
    }
    return null;
  }

  // Método para obtener estadísticas del dashboard
  getDashboardStats() {
    const projects = this.getAll('projects');
    const users = this.getAll('users');
    const tasks = this.getAll('tasks');
    
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'En progreso').length,
      totalUsers: users.filter(u => u.active).length,
      completedTasks: tasks.filter(t => t.status === 'Completada').length,
      pendingTasks: tasks.filter(t => t.status === 'Pendiente').length,
      inProgressTasks: tasks.filter(t => t.status === 'En progreso').length
    };
  }

  // Métodos específicos para comentarios
  getProjectComments(projectId) {
    const comments = this.getAll('comments');
    return comments.filter(comment => comment.project_id === parseInt(projectId));
  }

  createComment(projectId, userId, content, parentId = null, attachments = []) {
    const newComment = {
      id: Date.now(),
      project_id: parseInt(projectId),
      user_id: parseInt(userId),
      content: content.trim(),
      parent_id: parentId ? parseInt(parentId) : null,
      attachments: attachments,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const comments = this.getAll('comments');
    comments.push(newComment);
    this.saveAll('comments', comments);
    return newComment;
  }

  updateComment(commentId, content) {
    const comments = this.getAll('comments');
    const index = comments.findIndex(comment => comment.id === parseInt(commentId));
    
    if (index !== -1) {
      comments[index] = {
        ...comments[index],
        content: content.trim(),
        updated_at: new Date().toISOString()
      };
      this.saveAll('comments', comments);
      return comments[index];
    }
    return null;
  }

  deleteComment(commentId) {
    const comments = this.getAll('comments');
    
    // Eliminar el comentario y todos sus hijos (replies)
    const toDelete = [];
    const findCommentAndChildren = (id) => {
      toDelete.push(parseInt(id));
      const children = comments.filter(c => c.parent_id === parseInt(id));
      children.forEach(child => findCommentAndChildren(child.id));
    };
    
    findCommentAndChildren(commentId);
    
    const filteredComments = comments.filter(comment => !toDelete.includes(comment.id));
    this.saveAll('comments', filteredComments);
    return true;
  }

  getCommentWithUser(commentId) {
    const comment = this.getById('comments', commentId);
    if (comment) {
      const user = this.getUserById(comment.user_id);
      return {
        ...comment,
        user: user
      };
    }
    return null;
  }

  // Métodos para manejar adjuntos
  createAttachment(file, commentId = null) {
    const attachment = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      type: file.type,
      data: null, // Simulado - en producción sería URL o base64
      comment_id: commentId ? parseInt(commentId) : null,
      created_at: new Date().toISOString()
    };

    // Simular la carga del archivo
    if (file.type.startsWith('image/')) {
      attachment.data = `data:${file.type};base64,/9j/4AAQSkZJRgABAQAAAQABAAD...`; // Base64 simulado
    } else {
      attachment.data = `file_${attachment.id}_${file.name}`; // URL simulada
    }

    const attachments = this.getAll('attachments');
    attachments.push(attachment);
    this.saveAll('attachments', attachments);
    return attachment;
  }

  getCommentAttachments(commentId) {
    const attachments = this.getAll('attachments');
    return attachments.filter(attachment => attachment.comment_id === parseInt(commentId));
  }

  deleteAttachment(attachmentId) {
    const attachments = this.getAll('attachments');
    const filteredAttachments = attachments.filter(attachment => attachment.id !== parseInt(attachmentId));
    this.saveAll('attachments', filteredAttachments);
    return true;
  }
}

// Exportar instancia única
export default new DataService();
