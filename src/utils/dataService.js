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
  METRIC_HISTORY: 'eco_metric_history'
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
      start_date: '2024-01-15',
      end_date: '2024-12-15',
      status: 'En progreso',
      creator_id: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Pared Verde Sustentable',
      description: 'Implementación de muros verdes para reducir la temperatura urbana',
      start_date: '2024-02-01',
      end_date: '2024-11-30',
      status: 'En progreso',
      creator_id: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Tesis Huella Hídrica',
      description: 'Análisis del consumo de agua en la agricultura local',
      start_date: '2024-03-01',
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

  tasks: [
    {
      id: 1,
      title: 'Análisis de Emisiones CO2',
      description: 'Realizar medición y análisis de las emisiones de carbono del proyecto',
      status: 'En progreso',
      priority: 'Alta',
      due_date: '2024-02-15',
      project_id: 1,
      assigned_users: [3, 4],
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Instalación de Sensores',
      description: 'Colocar sensores de monitoreo ambiental en las ubicaciones designadas',
      status: 'Pendiente',
      priority: 'Media',
      due_date: '2024-02-20',
      project_id: 1,
      assigned_users: [3],
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Reporte Mensual',
      description: 'Generar reporte mensual de progreso del proyecto',
      status: 'Completada',
      priority: 'Media',
      due_date: '2024-01-31',
      project_id: 1,
      assigned_users: [4],
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Diseño de Pared Verde',
      description: 'Crear diseño arquitectónico para la implementación del muro verde',
      status: 'En progreso',
      priority: 'Alta',
      due_date: '2024-02-25',
      project_id: 2,
      assigned_users: [3],
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      title: 'Selección de Plantas',
      description: 'Investigar y seleccionar especies de plantas adecuadas para el clima local',
      status: 'Pendiente',
      priority: 'Media',
      due_date: '2024-03-01',
      project_id: 2,
      assigned_users: [4],
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      title: 'Análisis de Consumo Hídrico',
      description: 'Estudiar patrones de consumo de agua en la región',
      status: 'Pendiente',
      priority: 'Crítica',
      due_date: '2024-02-10',
      project_id: 3,
      assigned_users: [3, 4],
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
    { id: 1, task_id: 1, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 2, task_id: 1, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 3, task_id: 2, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 4, task_id: 3, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 5, task_id: 4, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 6, task_id: 5, user_id: 4, assigned_at: new Date().toISOString() },
    { id: 7, task_id: 6, user_id: 3, assigned_at: new Date().toISOString() },
    { id: 8, task_id: 6, user_id: 4, assigned_at: new Date().toISOString() }
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
}

// Exportar instancia única
export default new DataService();
