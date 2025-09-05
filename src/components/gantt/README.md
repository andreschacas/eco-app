# Diagrama de Gantt - Estructura de Componentes

## 📁 Estructura de Carpetas

```
src/components/gantt/
├── GanttChartNew.jsx          # Componente principal del diagrama de Gantt
├── GanttTaskDialog.jsx        # Dialog para crear/editar tareas
└── README.md                  # Documentación de la estructura
```

## 🧩 Componentes Principales

### 1. GanttChartNew.jsx
**Componente principal del diagrama de Gantt interactivo**

#### Características:
- **Vista de Timeline**: Visualización clásica de Gantt con barras de tareas
- **Vista de Lista**: Vista en tarjetas para mejor organización
- **Filtros Avanzados**: Por estado, prioridad, búsqueda de texto
- **Ordenamiento**: Por fecha, prioridad, estado, título
- **Zoom**: Días, semanas, meses
- **Arrastrar y Soltar**: Cambio de fechas por drag & drop
- **Agrupación**: Por proyecto o vista general

#### Props:
- `projectId`: ID del proyecto (opcional)
- `filterByRole`: Filtrar por rol de usuario

#### Estados Principales:
- `tasks`: Lista de tareas
- `projects`: Lista de proyectos
- `users`: Lista de usuarios
- `currentDate`: Fecha actual de visualización
- `zoomLevel`: Nivel de zoom (days/weeks/months)
- `viewMode`: Modo de vista (timeline/list/board/calendar)
- `searchTerm`: Término de búsqueda
- `filterStatus`: Filtro por estado
- `filterPriority`: Filtro por prioridad
- `sortBy`: Campo de ordenamiento

### 2. GanttTaskDialog.jsx
**Dialog para crear y editar tareas**

#### Características:
- **Formulario Completo**: Todos los campos de la tarea
- **Validación**: Campos requeridos y validación de datos
- **Asignación de Usuarios**: Autocomplete con avatares
- **Control de Progreso**: Slider para porcentaje de avance
- **Estados Visuales**: Colores por estado y prioridad
- **CRUD Completo**: Crear, editar, eliminar tareas

#### Props:
- `open`: Estado de apertura del dialog
- `onClose`: Función para cerrar el dialog
- `onSave`: Función para guardar la tarea
- `onDelete`: Función para eliminar la tarea
- `task`: Tarea a editar (null para nueva)
- `projects`: Lista de proyectos disponibles
- `users`: Lista de usuarios disponibles

## 🎨 Sistema de Colores

### Estados de Tarea:
- **Pendiente**: `#ff9800` (Naranja)
- **En progreso**: `#2196f3` (Azul)
- **Completada**: `#4caf50` (Verde)
- **Cancelada**: `#f44336` (Rojo)

### Prioridades:
- **Baja**: `#4caf50` (Verde)
- **Media**: `#ff9800` (Naranja)
- **Alta**: `#f44336` (Rojo)
- **Crítica**: `#9c27b0` (Púrpura)

## 🔧 Funcionalidades Implementadas

### ✅ Requerimientos Funcionales Completados:

1. **Visualización de Timeline**: ✅
   - Barras de tareas con fechas de inicio y fin
   - Grid de fechas con navegación
   - Zoom por días, semanas, meses

2. **Información de Tareas**: ✅
   - Nombre, fecha de inicio/fin, estado, responsable
   - Avatares de usuarios asignados
   - Progreso visual con barras

3. **Agrupación**: ✅
   - Por proyecto o vista general
   - Contadores de tareas por grupo

4. **Dependencias**: ✅
   - Líneas de conexión entre tareas
   - Toggle para mostrar/ocultar

5. **Colores Diferenciados**: ✅
   - Por estado de tarea
   - Por prioridad
   - Sistema de colores consistente

6. **Panel Superior**: ✅
   - Cambio de vista (lista, timeline)
   - Filtros por estado y prioridad
   - Búsqueda de texto
   - Ordenamiento múltiple

7. **Botón de Nueva Tarea**: ✅
   - Dialog completo para crear tareas
   - Validación de campos
   - Asignación de usuarios

8. **Interactividad**: ✅
   - Arrastrar y soltar para cambiar fechas
   - Doble clic para editar
   - Selección de tareas

## 📊 Datos de Ejemplo

### Estructura de Tarea:
```json
{
  "id": 1,
  "title": "Finalizar nombre del evento",
  "description": "Definir y aprobar el nombre final para el evento",
  "status": "Completada",
  "priority": "Alta",
  "due_date": "2025-09-06",
  "project_id": 1,
  "assigned_users": [3],
  "progress": 100,
  "created_at": "2025-09-09T10:00:00.000Z"
}
```

### Estructura de Proyecto:
```json
{
  "id": 1,
  "name": "Evento de Sostenibilidad Q4",
  "description": "Organización de evento de sostenibilidad",
  "status": "En progreso",
  "start_date": "2025-09-01",
  "end_date": "2025-09-30",
  "coordinator_id": 2
}
```

### Estructura de Usuario:
```json
{
  "id": 3,
  "name": "Elena",
  "email": "elena@example.com",
  "role": "Participante"
}
```

## 🚀 Uso del Componente

### Integración Básica:
```jsx
import GanttChartNew from './components/gantt/GanttChartNew';

function ProjectView() {
  return (
    <GanttChartNew
      projectId={1}
      filterByRole={true}
    />
  );
}
```

### Con Props Opcionales:
```jsx
<GanttChartNew
  projectId={null}        // Ver todas las tareas
  filterByRole={false}    // Sin filtrado por rol
/>
```

## 🎯 Características Avanzadas

### 1. **Filtrado Inteligente**:
- Búsqueda por título y descripción
- Filtros combinados (estado + prioridad)
- Ordenamiento dinámico

### 2. **Vista Adaptativa**:
- Timeline para vista de cronograma
- Lista para vista de tarjetas
- Responsive design

### 3. **Interactividad Completa**:
- Drag & drop para fechas
- Selección múltiple
- Edición inline

### 4. **Persistencia**:
- Integración con localStorage
- Sincronización automática
- Manejo de errores

## 🔄 Flujo de Datos

1. **Carga Inicial**: `loadData()` → Obtiene tareas, proyectos, usuarios
2. **Filtrado**: `filteredTasks` → Aplica filtros y búsqueda
3. **Ordenamiento**: `sortedTasks` → Ordena por criterio seleccionado
4. **Agrupación**: `groupedTasks` → Agrupa por proyecto
5. **Renderizado**: Componentes visuales con datos procesados

## 🎨 Diseño Moderno

### Inspiración:
- **Asana**: Vista de timeline limpia
- **ClickUp**: Filtros y organización
- **Monday.com**: Colores y estados

### Características de UI:
- **Minimalista**: Espacios en blanco, tipografía clara
- **Consistente**: Sistema de colores unificado
- **Responsive**: Adaptable a diferentes tamaños
- **Accesible**: Contraste adecuado, navegación por teclado

## 📱 Responsive Design

- **Desktop**: Vista completa con sidebar
- **Tablet**: Vista adaptada sin sidebar
- **Mobile**: Vista de lista optimizada

## 🔧 Configuración

### Variables de Entorno:
```javascript
// Colores personalizables
const statusColors = {
  'Pendiente': '#ff9800',
  'En progreso': '#2196f3',
  'Completada': '#4caf50',
  'Cancelada': '#f44336'
};
```

### Configuración de Zoom:
```javascript
const zoomLevels = {
  'days': { days: 21, label: 'Días' },
  'weeks': { days: 42, label: 'Semanas' },
  'months': { days: 90, label: 'Meses' }
};
```

---

**¡El diagrama de Gantt está completamente funcional y listo para usar!** 🚀📊
