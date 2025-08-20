// Sistema de caché inteligente y sincronización entre pestañas
class CacheService {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
    this.syncChannel = null;
    this.initBroadcastChannel();
    this.setupStorageListener();
  }

  // Inicializar BroadcastChannel para sincronización entre pestañas
  initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.syncChannel = new BroadcastChannel('eco_app_sync');
      this.syncChannel.addEventListener('message', (event) => {
        this.handleSyncMessage(event.data);
      });
    }
  }

  // Escuchar cambios en localStorage para sincronización
  setupStorageListener() {
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith('eco_')) {
        this.invalidateCache(event.key);
        this.notifyListeners(event.key, 'storage_change', JSON.parse(event.newValue));
      }
    });
  }

  // Manejar mensajes de sincronización entre pestañas
  handleSyncMessage(data) {
    const { type, key, value, timestamp } = data;
    
    switch (type) {
      case 'cache_update':
        this.setCache(key, value, false); // No propagar para evitar loops
        this.notifyListeners(key, 'sync_update', value);
        break;
      case 'cache_invalidate':
        this.invalidateCache(key, false);
        this.notifyListeners(key, 'sync_invalidate', null);
        break;
      case 'data_change':
        this.invalidateRelatedCaches(key);
        this.notifyListeners(key, 'data_change', value);
        break;
    }
  }

  // Broadcast mensaje a otras pestañas
  broadcast(message) {
    if (this.syncChannel) {
      this.syncChannel.postMessage({
        ...message,
        timestamp: Date.now()
      });
    }
  }

  // Obtener datos con caché inteligente
  get(key, fetchFunction, options = {}) {
    const {
      ttl = 300000, // 5 minutos por defecto
      forceRefresh = false,
      dependencies = []
    } = options;

    // Verificar caché
    if (!forceRefresh && this.cache.has(key)) {
      const cached = this.cache.get(key);
      const now = Date.now();
      
      if (now - cached.timestamp < ttl) {
        // Verificar dependencias
        if (this.areDependenciesValid(cached.dependencies)) {
          return Promise.resolve(cached.data);
        }
      }
    }

    // Fetch fresh data
    return this.fetchAndCache(key, fetchFunction, { ttl, dependencies });
  }

  // Fetch y cachear datos
  async fetchAndCache(key, fetchFunction, options = {}) {
    try {
      const data = await fetchFunction();
      this.setCache(key, data, true, options);
      return data;
    } catch (error) {
      console.error(`Error fetching data for key ${key}:`, error);
      throw error;
    }
  }

  // Establecer caché
  setCache(key, data, shouldBroadcast = true, options = {}) {
    const { ttl = 300000, dependencies = [] } = options;
    
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      dependencies: dependencies.map(dep => ({
        key: dep,
        timestamp: this.getDependencyTimestamp(dep)
      }))
    };

    this.cache.set(key, cacheEntry);

    if (shouldBroadcast) {
      this.broadcast({
        type: 'cache_update',
        key,
        value: data
      });
    }
  }

  // Invalidar caché
  invalidateCache(key, shouldBroadcast = true) {
    this.cache.delete(key);
    
    if (shouldBroadcast) {
      this.broadcast({
        type: 'cache_invalidate',
        key
      });
    }
  }

  // Invalidar cachés relacionados
  invalidateRelatedCaches(changedKey) {
    const keysToInvalidate = [];
    
    for (const [cacheKey, cacheEntry] of this.cache.entries()) {
      if (cacheEntry.dependencies.some(dep => dep.key === changedKey)) {
        keysToInvalidate.push(cacheKey);
      }
    }

    keysToInvalidate.forEach(key => this.invalidateCache(key, false));
  }

  // Verificar si las dependencias son válidas
  areDependenciesValid(dependencies) {
    return dependencies.every(dep => {
      const currentTimestamp = this.getDependencyTimestamp(dep.key);
      return currentTimestamp <= dep.timestamp;
    });
  }

  // Obtener timestamp de dependencia (última modificación en localStorage)
  getDependencyTimestamp(key) {
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    
    try {
      const data = JSON.parse(stored);
      // Buscar el objeto más reciente modificado
      if (Array.isArray(data)) {
        return Math.max(...data.map(item => 
          new Date(item.updated_at || item.created_at || Date.now()).getTime()
        ));
      } else if (data.updated_at || data.created_at) {
        return new Date(data.updated_at || data.created_at).getTime();
      }
    } catch (error) {
      console.warn(`Error parsing stored data for key ${key}:`, error);
    }
    
    return Date.now();
  }

  // Registrar listener para cambios
  addListener(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
  }

  // Remover listener
  removeListener(key, callback) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).delete(callback);
    }
  }

  // Notificar listeners
  notifyListeners(key, type, data) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => {
        try {
          callback(data, type);
        } catch (error) {
          console.error('Error in cache listener:', error);
        }
      });
    }
  }

  // Métodos específicos para la aplicación
  
  // Caché para usuarios
  getUsers(forceRefresh = false) {
    return this.get('users', () => {
      const users = JSON.parse(localStorage.getItem('eco_users') || '[]');
      return users.filter(user => user.active);
    }, {
      ttl: 600000, // 10 minutos
      forceRefresh
    });
  }

  // Caché para proyectos
  getProjects(forceRefresh = false) {
    return this.get('projects', () => {
      return JSON.parse(localStorage.getItem('eco_projects') || '[]');
    }, {
      ttl: 300000, // 5 minutos
      dependencies: ['eco_projects'],
      forceRefresh
    });
  }

  // Caché para tareas con dependencias
  getTasks(projectId = null, forceRefresh = false) {
    const cacheKey = projectId ? `tasks_project_${projectId}` : 'tasks_all';
    
    return this.get(cacheKey, () => {
      const tasks = JSON.parse(localStorage.getItem('eco_tasks') || '[]');
      return projectId ? tasks.filter(task => task.project_id === projectId) : tasks;
    }, {
      ttl: 180000, // 3 minutos
      dependencies: ['eco_tasks', 'eco_task_assignments'],
      forceRefresh
    });
  }

  // Caché para métricas
  getMetrics(projectId, forceRefresh = false) {
    return this.get(`metrics_${projectId}`, () => {
      const metrics = JSON.parse(localStorage.getItem('eco_metrics') || '[]');
      return metrics.filter(metric => metric.project_id === projectId);
    }, {
      ttl: 300000, // 5 minutos
      dependencies: ['eco_metrics', 'eco_metric_history'],
      forceRefresh
    });
  }

  // Caché para dashboard data
  getDashboardData(userId, role, forceRefresh = false) {
    return this.get(`dashboard_${userId}`, async () => {
      // Simular agregación de datos para dashboard
      const projects = await this.getProjects();
      const tasks = await this.getTasks();
      const users = await this.getUsers();

      let dashboardData = {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        totalUsers: users.length,
        recentActivity: [],
        upcomingDeadlines: [],
        tasksByStatus: {},
        projectsByStatus: {}
      };

      // Filtrar por rol
      if (role === 'Coordinador') {
        const userProjects = projects.filter(p => p.creator_id === userId);
        const userTasks = tasks.filter(t => userProjects.some(p => p.id === t.project_id));
        
        dashboardData.totalProjects = userProjects.length;
        dashboardData.totalTasks = userTasks.length;
      } else if (role === 'Participante') {
        const userTasks = tasks.filter(t => 
          t.assigned_users && t.assigned_users.includes(userId)
        );
        const userProjects = projects.filter(p => 
          userTasks.some(t => t.project_id === p.id)
        );
        
        dashboardData.totalProjects = userProjects.length;
        dashboardData.totalTasks = userTasks.length;
      }

      return dashboardData;
    }, {
      ttl: 120000, // 2 minutos
      dependencies: ['eco_projects', 'eco_tasks', 'eco_users'],
      forceRefresh
    });
  }

  // Limpiar caché expirado
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Obtener estadísticas del caché
  getStats() {
    return {
      cacheSize: this.cache.size,
      listeners: Array.from(this.listeners.keys()).length,
      entries: Array.from(this.cache.keys())
    };
  }

  // Notificar cambio de datos para invalidar cachés relacionados
  notifyDataChange(key, data) {
    this.invalidateRelatedCaches(key);
    this.broadcast({
      type: 'data_change',
      key,
      value: data
    });
  }

  // Prefetch datos comunes
  async prefetchCommonData() {
    try {
      await Promise.all([
        this.getUsers(),
        this.getProjects(),
        this.getTasks()
      ]);
    } catch (error) {
      console.error('Error prefetching data:', error);
    }
  }
}

// Instancia singleton
const cacheService = new CacheService();

// Limpiar caché expirado cada 5 minutos
setInterval(() => {
  cacheService.cleanup();
}, 300000);

export default cacheService;
