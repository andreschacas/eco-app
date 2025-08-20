import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import DatePicker from '@mui/lab/DatePicker';
import Autocomplete from '@mui/material/Autocomplete';
import Slider from '@mui/material/Slider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import { motion, AnimatePresence } from 'framer-motion';

const GREEN = '#2AAC26';

const AdvancedFilters = ({ 
  onFiltersChange, 
  filterConfig = {},
  data = [],
  savedFilters = [],
  onSaveFilter,
  onDeleteFilter
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Configuración por defecto de filtros
  const defaultConfig = {
    search: { enabled: true, placeholder: 'Buscar...' },
    status: { enabled: true, options: [] },
    priority: { enabled: true, options: ['Baja', 'Media', 'Alta', 'Crítica'] },
    dateRange: { enabled: true },
    assignedUser: { enabled: true },
    project: { enabled: true },
    progress: { enabled: false, min: 0, max: 100 },
    tags: { enabled: false, options: [] },
    customFields: []
  };

  const config = { ...defaultConfig, ...filterConfig };

  useEffect(() => {
    // Aplicar filtros cuando cambien
    const filteredData = applyFilters(data, filters);
    onFiltersChange(filteredData, filters);
    updateActiveFilters();
  }, [filters, data]);

  const applyFilters = (data, filters) => {
    return data.filter(item => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = Object.values(item).join(' ').toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }

      // Filtro de estado
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Filtro de prioridad
      if (filters.priority && item.priority !== filters.priority) {
        return false;
      }

      // Filtro de rango de fechas
      if (filters.startDate || filters.endDate) {
        const itemDate = new Date(item.created_at || item.start_date || item.due_date);
        if (filters.startDate && itemDate < new Date(filters.startDate)) return false;
        if (filters.endDate && itemDate > new Date(filters.endDate)) return false;
      }

      // Filtro de usuario asignado
      if (filters.assignedUser) {
        if (item.assigned_users && Array.isArray(item.assigned_users)) {
          if (!item.assigned_users.includes(parseInt(filters.assignedUser))) return false;
        } else if (item.assigned_user_id !== parseInt(filters.assignedUser)) {
          return false;
        }
      }

      // Filtro de proyecto
      if (filters.project && item.project_id !== parseInt(filters.project)) {
        return false;
      }

      // Filtro de progreso
      if (filters.progress !== undefined) {
        const itemProgress = item.progress || 0;
        if (itemProgress < filters.progress[0] || itemProgress > filters.progress[1]) {
          return false;
        }
      }

      // Filtros personalizados
      for (const customField of config.customFields) {
        const filterValue = filters[customField.key];
        if (filterValue !== undefined && filterValue !== '') {
          if (customField.type === 'select' && item[customField.key] !== filterValue) {
            return false;
          }
          if (customField.type === 'multiselect' && filterValue.length > 0) {
            if (!filterValue.includes(item[customField.key])) return false;
          }
          if (customField.type === 'boolean' && item[customField.key] !== filterValue) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const updateActiveFilters = () => {
    const active = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value) && value.length === 0) return;
        if (key === 'progress' && value[0] === 0 && value[1] === 100) return;
        
        active.push({
          key,
          value,
          label: getFilterLabel(key, value)
        });
      }
    });
    setActiveFilters(active);
  };

  const getFilterLabel = (key, value) => {
    switch (key) {
      case 'search':
        return `Búsqueda: "${value}"`;
      case 'status':
        return `Estado: ${value}`;
      case 'priority':
        return `Prioridad: ${value}`;
      case 'startDate':
        return `Desde: ${new Date(value).toLocaleDateString()}`;
      case 'endDate':
        return `Hasta: ${new Date(value).toLocaleDateString()}`;
      case 'assignedUser':
        return `Usuario: ${getUserName(value)}`;
      case 'project':
        return `Proyecto: ${getProjectName(value)}`;
      case 'progress':
        return `Progreso: ${value[0]}% - ${value[1]}%`;
      default:
        const customField = config.customFields.find(f => f.key === key);
        if (customField) {
          return `${customField.label}: ${Array.isArray(value) ? value.join(', ') : value}`;
        }
        return `${key}: ${value}`;
    }
  };

  const getUserName = (userId) => {
    // Aquí podrías obtener el nombre del usuario desde dataService
    return `Usuario ${userId}`;
  };

  const getProjectName = (projectId) => {
    // Aquí podrías obtener el nombre del proyecto desde dataService
    return `Proyecto ${projectId}`;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const removeFilter = (key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const saveCurrentFilter = () => {
    if (filterName.trim()) {
      const filterToSave = {
        name: filterName,
        filters,
        createdAt: new Date().toISOString()
      };
      onSaveFilter(filterToSave);
      setSaveDialogOpen(false);
      setFilterName('');
    }
  };

  const applySavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ pb: expanded ? 2 : 1 }}>
        {/* Header con filtros activos */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: expanded ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Button
              startIcon={<FilterListIcon />}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setExpanded(!expanded)}
              sx={{
                color: activeFilters.length > 0 ? GREEN : '#666',
                borderColor: activeFilters.length > 0 ? GREEN : '#ddd',
                bgcolor: activeFilters.length > 0 ? `${GREEN}10` : 'transparent',
                border: '1px solid',
                textTransform: 'none',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500
              }}
            >
              Filtros {activeFilters.length > 0 && `(${activeFilters.length})`}
            </Button>

            {/* Chips de filtros activos */}
            <AnimatePresence>
              {activeFilters.map((filter) => (
                <motion.div
                  key={filter.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Chip
                    label={filter.label}
                    onDelete={() => removeFilter(filter.key)}
                    size="small"
                    sx={{
                      bgcolor: `${GREEN}20`,
                      color: GREEN,
                      fontFamily: 'Poppins, sans-serif',
                      '& .MuiChip-deleteIcon': { color: GREEN }
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>

          {activeFilters.length > 0 && (
            <Button
              size="small"
              onClick={clearAllFilters}
              startIcon={<ClearIcon />}
              sx={{
                color: '#f44336',
                textTransform: 'none',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              Limpiar
            </Button>
          )}
        </Box>

        {/* Panel de filtros expandido */}
        <Collapse in={expanded}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Búsqueda */}
              {config.search.enabled && (
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder={config.search.placeholder}
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: '#666', mr: 1 }} />
                    }}
                    size="small"
                  />
                </Grid>
              )}

              {/* Estado */}
              {config.status.enabled && (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      label="Estado"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {config.status.options.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Prioridad */}
              {config.priority.enabled && (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                      value={filters.priority || ''}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      label="Prioridad"
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {config.priority.options.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Proyecto */}
              {config.project.enabled && (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Proyecto</InputLabel>
                    <Select
                      value={filters.project || ''}
                      onChange={(e) => handleFilterChange('project', e.target.value)}
                      label="Proyecto"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {/* Aquí cargarías los proyectos dinámicamente */}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Rango de fechas */}
              {config.dateRange.enabled && (
                <>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Fecha desde"
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Fecha hasta"
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>
                </>
              )}

              {/* Progreso */}
              {config.progress.enabled && (
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ mb: 1, fontFamily: 'Poppins, sans-serif' }}>
                    Progreso: {filters.progress?.[0] || 0}% - {filters.progress?.[1] || 100}%
                  </Typography>
                  <Slider
                    value={filters.progress || [0, 100]}
                    onChange={(e, value) => handleFilterChange('progress', value)}
                    valueLabelDisplay="auto"
                    min={config.progress.min}
                    max={config.progress.max}
                    sx={{ color: GREEN }}
                  />
                </Grid>
              )}

              {/* Campos personalizados */}
              {config.customFields.map((field) => (
                <Grid item xs={12} md={field.width || 3} key={field.key}>
                  {field.type === 'select' && (
                    <FormControl fullWidth size="small">
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        value={filters[field.key] || ''}
                        onChange={(e) => handleFilterChange(field.key, e.target.value)}
                        label={field.label}
                      >
                        <MenuItem value="">Todos</MenuItem>
                        {field.options.map((option) => (
                          <MenuItem key={option.value || option} value={option.value || option}>
                            {option.label || option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {field.type === 'boolean' && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters[field.key] || false}
                          onChange={(e) => handleFilterChange(field.key, e.target.checked)}
                          sx={{ color: GREEN }}
                        />
                      }
                      label={field.label}
                    />
                  )}
                </Grid>
              ))}
            </Grid>

            {/* Acciones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
              <Stack direction="row" spacing={1}>
                {savedFilters.length > 0 && (
                  <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Filtros guardados:
                  </Typography>
                )}
                {savedFilters.slice(0, 3).map((savedFilter) => (
                  <Chip
                    key={savedFilter.name}
                    label={savedFilter.name}
                    onClick={() => applySavedFilter(savedFilter)}
                    icon={<FavoriteIcon />}
                    size="small"
                    sx={{
                      bgcolor: '#e3f2fd',
                      color: '#1976d2',
                      fontFamily: 'Poppins, sans-serif',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#bbdefb' }
                    }}
                  />
                ))}
              </Stack>

              <Button
                startIcon={<SaveIcon />}
                onClick={() => setSaveDialogOpen(true)}
                disabled={activeFilters.length === 0}
                sx={{
                  color: GREEN,
                  borderColor: GREEN,
                  textTransform: 'none',
                  fontFamily: 'Poppins, sans-serif'
                }}
                variant="outlined"
                size="small"
              >
                Guardar Filtros
              </Button>
            </Box>
          </motion.div>
        </Collapse>
      </CardContent>

      {/* Dialog para guardar filtros */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif' }}>
          Guardar Configuración de Filtros
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre del filtro"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Ej: Tareas pendientes alta prioridad"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={saveCurrentFilter}
            disabled={!filterName.trim()}
            variant="contained"
            sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#1f9a1f' } }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default AdvancedFilters;
