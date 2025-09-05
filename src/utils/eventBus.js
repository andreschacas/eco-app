// Event Bus para comunicación entre componentes
class EventBus {
  constructor() {
    this.events = {};
  }

  // Suscribirse a un evento
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // Desuscribirse de un evento
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  // Emitir un evento
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  // Limpiar todos los eventos
  clear() {
    this.events = {};
  }
}

// Instancia global del Event Bus
const eventBus = new EventBus();

export default eventBus;
