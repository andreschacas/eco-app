# Sistema de Roles ECO - Gestión de Proyectos de Energía y Cambio Climático

## Overview

El sistema ECO ahora incluye un completo sistema de gestión de proyectos con tres roles principales: **Administrador**, **Coordinador** y **Participante**. Cada rol tiene vistas y permisos específicos.

## Credenciales Demo

### Administrador
- **Email:** admin@eco.com
- **Contraseña:** admin123
- **Permisos:** Acceso completo al sistema

### Coordinador
- **Email:** coordinator@eco.com
- **Contraseña:** coord123
- **Permisos:** Gestión de proyectos y tareas

### Participante
- **Email:** participant@eco.com
- **Contraseña:** part123
- **Permisos:** Visualización y actualización de tareas asignadas

## Estructura de Roles

### 👑 Administrador
**Vistas principales:**
- `/admin/dashboard` - Panel de control con estadísticas generales
- `/admin/usuarios` - Gestión completa de usuarios (CRUD)
- `/admin/proyectos` - Gestión completa de proyectos (CRUD)

**Funcionalidades:**
- ✅ Crear, editar y eliminar usuarios
- ✅ Asignar roles y cargos
- ✅ Crear, editar y eliminar proyectos
- ✅ Ver estadísticas generales del sistema
- ✅ Gestionar todos los aspectos del sistema

### 🎯 Coordinador
**Vistas principales:**
- `/coordinador/dashboard` - Panel con sus proyectos asignados
- `/proyecto/:id` - Vista detallada de proyecto individual

**Funcionalidades:**
- ✅ Ver y gestionar sus proyectos asignados
- ✅ Crear, editar y eliminar tareas dentro de sus proyectos
- ✅ Asignar tareas a participantes del proyecto
- ✅ Gestionar participantes del proyecto (agregar/remover)
- ✅ Actualizar métricas del proyecto
- ✅ Ver progreso y estadísticas de sus proyectos

### 👥 Participante
**Vistas principales:**
- `/participante/dashboard` - Panel con tareas asignadas

**Funcionalidades:**
- ✅ Ver sus tareas asignadas organizadas por estado
- ✅ Actualizar el estado de sus tareas (Pendiente → En progreso → Completada)
- ✅ Ver detalles de las tareas y fechas de vencimiento
- ✅ Recibir alertas sobre tareas vencidas

## Estructura de Datos

### Entidades Principales
- **usuarios** - Información de usuarios con roles y cargos
- **proyectos** - Proyectos de energía y cambio climático
- **tareas** - Tareas específicas dentro de proyectos
- **metricas** - Métricas de seguimiento de proyectos
- **roles** - Definición de roles del sistema
- **cargos** - Cargos/posiciones organizacionales

### Relaciones
- Un usuario puede tener múltiples proyectos (coordinador)
- Un proyecto puede tener múltiples participantes
- Una tarea puede estar asignada a múltiples usuarios
- Un proyecto puede tener múltiples métricas

## Sistema de Persistencia

Los datos se almacenan en **localStorage** del navegador para simular una base de datos. Esto permite:
- ✅ Persistencia entre recargas de página
- ✅ Gestión completa de CRUD
- ✅ Simulación realista de un backend

## Navegación Basada en Roles

El sidebar se adapta automáticamente según el rol del usuario:

**Administrador:**
- Dashboard
- Gestión de Usuarios  
- Gestión de Proyectos
- Configuración
- Ayuda

**Coordinador:**
- Dashboard
- Mis Proyectos
- Configuración
- Ayuda

**Participante:**
- Mis Tareas
- Configuración
- Ayuda

## Compatibilidad

El sistema mantiene **compatibilidad total** con las vistas existentes:
- ✅ Home (vista de proyectos legacy)
- ✅ KanbanView
- ✅ TasksToday
- ✅ ParticipantsView
- ✅ ReportsView
- ✅ SettingsView
- ✅ HelpView

Las vistas legacy están disponibles pero las **nuevas vistas basadas en roles tienen prioridad**.

## Componentes Clave

### Autenticación Mejorada
- `AuthContext.jsx` - Context con soporte para roles y permisos
- `Auth.jsx` - Vista de login con botones demo

### Gestión de Datos
- `dataService.js` - Servicio completo para gestión de datos con localStorage
- Incluye métodos específicos para cada entidad y relación

### Vistas por Rol
- `views/admin/` - Vistas específicas del administrador
- `views/coordinator/` - Vistas específicas del coordinador  
- `views/participant/` - Vistas específicas del participante

### Componentes de Protección
- `RoleBasedRoute.jsx` - Componente para proteger rutas según roles

## Flujo de Trabajo Típico

1. **Administrador** crea usuarios y proyectos
2. **Administrador** asigna coordinadores a proyectos
3. **Coordinador** gestiona tareas y participantes de sus proyectos
4. **Coordinador** asigna tareas específicas a participantes
5. **Participantes** actualizan el estado de sus tareas
6. **Coordinador** y **Administrador** monitorean progreso

## Características Avanzadas

- 🔒 **Sistema de permisos** granular
- 📊 **Dashboard con estadísticas** en tiempo real
- 🔍 **Filtros y búsquedas** avanzadas
- 📱 **Interfaz responsive** y moderna
- ⚡ **Actualizaciones en tiempo real** con localStorage
- 🎨 **UI/UX profesional** con Material-UI
- 📈 **Gestión de métricas** de proyectos
- ⏰ **Alertas de tareas vencidas**
- 🏷️ **Sistema de prioridades** para tareas

## Inicio Rápido

1. Inicia la aplicación
2. Usa uno de los botones demo en la pantalla de login
3. Explora las funcionalidades según tu rol
4. Los datos se persistirán automáticamente en localStorage

¡El sistema está listo para usar y completamente funcional! 🚀
