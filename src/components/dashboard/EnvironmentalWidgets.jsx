import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  Filler
} from 'chart.js';
import NatureIcon from '@mui/icons-material/Nature';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalculateIcon from '@mui/icons-material/Calculate';
import TimelineIcon from '@mui/icons-material/Timeline';
import PublicIcon from '@mui/icons-material/Public';
import dataService from '../../utils/dataService';
import environmentalMetricsService from '../../utils/environmentalMetricsService';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  Filler
);

const GREEN = '#2AAC26';

// Widget de Huella de Carbono
export const CarbonFootprintWidget = ({ projects, onNavigate }) => {
  const [carbonData, setCarbonData] = useState({
    current: 2.4,
    previous: 2.8,
    trend: -15,
    unit: 'tCO2'
  });

  const calculateCarbonFootprint = () => {
    // Usar métricas reales de los proyectos
    const carbonData = environmentalMetricsService.calculateTotalCarbonFootprint(projects);
    
    setCarbonData(prev => ({
      ...prev,
      current: carbonData.net.toFixed(1),
      reduction: carbonData.reduction.toFixed(1),
      emissions: carbonData.emissions.toFixed(1)
    }));
  };

  useEffect(() => {
    calculateCarbonFootprint();
  }, [projects]);

  return (
    <Card sx={{ 
      background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
      color: 'white',
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NatureIcon sx={{ mr: 1, fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Huella de Carbono
          </Typography>
        </Box>
        
        <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', mb: 1 }}>
          {carbonData.current} {carbonData.unit}
        </Typography>
        
        <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Poppins, sans-serif', mb: 2 }}>
          Reducido este mes
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingDownIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'Poppins, sans-serif' }}>
            {carbonData.trend}% vs mes anterior
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Widget de Energía Renovable
export const RenewableEnergyWidget = ({ projects }) => {
  const [energyData, setEnergyData] = useState({
    percentage: 87,
    trend: 5,
    projects: 0
  });

  const calculateRenewableEnergy = () => {
    // Usar métricas reales de energía renovable
    const energyData = environmentalMetricsService.calculateRenewableEnergy(projects);
    
    setEnergyData(prev => ({
      ...prev,
      percentage: Math.round(energyData.percentage),
      renewable: energyData.renewable,
      total: energyData.total
    }));
  };

  useEffect(() => {
    calculateRenewableEnergy();
  }, [projects]);

  return (
    <Card sx={{ 
      background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
      color: 'white',
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            width: 24, 
            height: 24, 
            borderRadius: '50%', 
            bgcolor: 'rgba(255,255,255,0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mr: 1
          }}>
            <Typography sx={{ fontSize: '16px' }}>⚡</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Energía Renovable
          </Typography>
        </Box>
        
        <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', mb: 1 }}>
          {energyData.percentage}%
        </Typography>
        
        <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Poppins, sans-serif', mb: 2 }}>
          De energía limpia utilizada
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'Poppins, sans-serif' }}>
            +{energyData.trend}% vs mes anterior
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Widget de Proyectos Verdes
export const GreenProjectsWidget = ({ projects }) => {
  const [greenData, setGreenData] = useState({
    total: 0,
    inProgress: 0,
    completed: 0
  });

  const calculateGreenProjects = () => {
    // Usar métricas reales para identificar proyectos verdes
    const greenProjects = environmentalMetricsService.calculateGreenProjects(projects);
    
    setGreenData({
      total: greenProjects.length,
      inProgress: greenProjects.filter(p => p.status === 'En progreso').length,
      completed: greenProjects.filter(p => p.status === 'Completado').length,
      totalImpact: greenProjects.reduce((sum, p) => sum + p.total_impact, 0)
    });
  };

  useEffect(() => {
    calculateGreenProjects();
  }, [projects]);

  return (
    <Card sx={{ 
      background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      color: 'white',
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(255, 152, 0, 0.3)'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NatureIcon sx={{ mr: 1, fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Proyectos Verdes
          </Typography>
        </Box>
        
        <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', mb: 1 }}>
          {greenData.total}
        </Typography>
        
        <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Poppins, sans-serif', mb: 2 }}>
          Proyectos sustentables activos
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: 'rgba(255,255,255,0.8)' 
          }} />
          <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'Poppins, sans-serif' }}>
            {greenData.inProgress} en progreso
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Widget de Calculadora de Huella de Carbono
export const CarbonCalculatorWidget = ({ projects }) => {
  const [open, setOpen] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    projectType: '',
    duration: '',
    participants: '',
    estimatedCarbon: 0
  });

  const calculateCarbon = () => {
    const { projectType, duration, participants } = calculatorData;
    if (!projectType || !duration || !participants) return;

    const baseEmissions = {
      'investigacion': 0.5,
      'implementacion': 1.2,
      'monitoreo': 0.3,
      'educacion': 0.2
    };

    const base = baseEmissions[projectType] || 0.5;
    const durationFactor = parseInt(duration) / 12; // meses
    const participantFactor = Math.log(parseInt(participants) + 1);

    const total = base * durationFactor * participantFactor;
    setCalculatorData(prev => ({ ...prev, estimatedCarbon: total.toFixed(2) }));
  };

  const handleCalculate = () => {
    calculateCarbon();
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Calculadora de Huella de Carbono
          </Typography>
          <IconButton onClick={() => setOpen(true)}>
            <CalculateIcon />
          </IconButton>
        </Box>

        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif', mb: 1 }}>
            {calculatorData.estimatedCarbon} tCO2
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            Estimación actual
          </Typography>
        </Box>

        <Button 
          variant="outlined" 
          fullWidth 
          onClick={() => setOpen(true)}
          sx={{ 
            borderColor: GREEN, 
            color: GREEN,
            fontFamily: 'Poppins, sans-serif',
            '&:hover': { borderColor: '#1f9a1f', bgcolor: '#e8f5e9' }
          }}
        >
          Calcular Nueva Huella
        </Button>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif' }}>
            Calculadora de Huella de Carbono
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
              <InputLabel>Tipo de Proyecto</InputLabel>
              <Select
                value={calculatorData.projectType}
                onChange={(e) => setCalculatorData(prev => ({ ...prev, projectType: e.target.value }))}
                label="Tipo de Proyecto"
              >
                <MenuItem value="investigacion">Investigación</MenuItem>
                <MenuItem value="implementacion">Implementación</MenuItem>
                <MenuItem value="monitoreo">Monitoreo</MenuItem>
                <MenuItem value="educacion">Educación</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Duración (meses)"
              type="number"
              value={calculatorData.duration}
              onChange={(e) => setCalculatorData(prev => ({ ...prev, duration: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Número de Participantes"
              type="number"
              value={calculatorData.participants}
              onChange={(e) => setCalculatorData(prev => ({ ...prev, participants: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} sx={{ fontFamily: 'Poppins, sans-serif' }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCalculate} 
              variant="contained"
              sx={{ 
                bgcolor: GREEN, 
                fontFamily: 'Poppins, sans-serif',
                '&:hover': { bgcolor: '#1f9a1f' }
              }}
            >
              Calcular
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Widget de Tracking de Emisiones en Tiempo Real
export const RealtimeEmissionsWidget = ({ projects }) => {
  const [emissionsData, setEmissionsData] = useState({
    current: 0,
    daily: [],
    weekly: []
  });

  const generateRealtimeData = () => {
    // Usar métricas reales para generar datos de emisiones
    const realtimeData = environmentalMetricsService.getRealtimeEmissionsData();
    
    setEmissionsData({
      current: realtimeData[realtimeData.length - 1]?.emissions || 0,
      daily: realtimeData,
      weekly: realtimeData // Usar los mismos datos por ahora
    });
  };

  useEffect(() => {
    generateRealtimeData();
    const interval = setInterval(generateRealtimeData, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, [projects]);

  const chartData = {
    labels: emissionsData.daily.map(d => d.time),
    datasets: [{
      label: 'Emisiones (tCO2/h)',
      data: emissionsData.daily.map(d => d.emissions),
      borderColor: '#f44336',
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Tracking de Emisiones
          </Typography>
          <IconButton>
            <TimelineIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336', fontFamily: 'Poppins, sans-serif' }}>
            {emissionsData.current.toFixed(2)} tCO2/h
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            Emisiones actuales
          </Typography>
        </Box>

        <Box sx={{ height: 200 }}>
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'tCO2/h'
                  }
                }
              }
            }} 
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Widget de Indicadores SDGs
export const SDGIndicatorsWidget = ({ projects }) => {
  const [sdgData, setSdgData] = useState([]);

  const calculateSDGProgress = () => {
    const sdgs = [
      { id: 6, name: 'Agua Limpia y Saneamiento', color: '#00AED9', progress: 0 },
      { id: 7, name: 'Energía Asequible y No Contaminante', color: '#FDB713', progress: 0 },
      { id: 11, name: 'Ciudades y Comunidades Sostenibles', color: '#FD9D24', progress: 0 },
      { id: 13, name: 'Acción por el Clima', color: '#3F7E44', progress: 0 },
      { id: 15, name: 'Vida de Ecosistemas Terrestres', color: '#56C02B', progress: 0 }
    ];

    // Calcular progreso basado en proyectos
    const updatedSdgs = sdgs.map(sdg => {
      const relevantProjects = projects.filter(p => {
        const name = p.name.toLowerCase();
        const description = p.description.toLowerCase();
        
        switch (sdg.id) {
          case 6: return name.includes('agua') || name.includes('hídrica') || description.includes('agua');
          case 7: return name.includes('energía') || name.includes('solar') || name.includes('eólico');
          case 11: return name.includes('urbano') || name.includes('ciudad') || name.includes('comunidad');
          case 13: return name.includes('carbono') || name.includes('clima') || name.includes('emisiones');
          case 15: return name.includes('biodiversidad') || name.includes('ecosistema') || name.includes('verde');
          default: return false;
        }
      });

      const progress = Math.min(100, (relevantProjects.length / 3) * 100);
      return { ...sdg, progress: Math.round(progress) };
    });

    setSdgData(updatedSdgs);
  };

  useEffect(() => {
    calculateSDGProgress();
  }, [projects]);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Indicadores SDGs
          </Typography>
          <IconButton>
            <PublicIcon />
          </IconButton>
        </Box>

        {sdgData.map((sdg) => (
          <Box key={sdg.id} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                SDG {sdg.id}: {sdg.name}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', color: '#666' }}>
                {sdg.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={sdg.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: sdg.color,
                  borderRadius: 4
                }
              }}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

// Widget de Análisis de Impacto por Proyecto
export const ProjectImpactWidget = ({ projects, onNavigate }) => {
  const [impactData, setImpactData] = useState([]);

  const calculateProjectImpact = () => {
    const impacts = projects.map(project => {
      const isGreen = project.name.toLowerCase().includes('verde') || 
                    project.name.toLowerCase().includes('sustentable') ||
                    project.name.toLowerCase().includes('ambiental');
      
      const carbonReduction = isGreen ? Math.random() * 5 + 1 : Math.random() * 2;
      const energySaved = isGreen ? Math.random() * 1000 + 500 : Math.random() * 300;
      
      return {
        ...project,
        carbonReduction: carbonReduction.toFixed(1),
        energySaved: Math.round(energySaved),
        impactScore: Math.round((carbonReduction * 10) + (energySaved / 100))
      };
    }).sort((a, b) => b.impactScore - a.impactScore);

    setImpactData(impacts.slice(0, 5)); // Top 5 proyectos
  };

  useEffect(() => {
    calculateProjectImpact();
  }, [projects]);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Análisis de Impacto
          </Typography>
          <IconButton>
            <NatureIcon />
          </IconButton>
        </Box>

        {impactData.map((project, index) => (
          <Box key={project.id} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                {project.name}
              </Typography>
              <Chip 
                label={`#${index + 1}`} 
                size="small" 
                sx={{ bgcolor: GREEN, color: 'white', fontFamily: 'Poppins, sans-serif' }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                  Reducción CO2
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  {project.carbonReduction} tCO2
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                  Energía Ahorrada
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  {project.energySaved} kWh
                </Typography>
              </Box>
            </Box>
            
            <LinearProgress
              variant="determinate"
              value={(project.impactScore / 100) * 100}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: GREEN,
                  borderRadius: 2
                }
              }}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};
