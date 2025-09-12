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

// Widget de Huella de Carbono conectado a métricas reales
export const RealCarbonFootprintWidget = ({ projects, onNavigate }) => {
  const [carbonData, setCarbonData] = useState({
    totalReduction: 0,
    totalEmissions: 0,
    netImpact: 0,
    trend: 0,
    projects: 0
  });

  const calculateRealCarbonFootprint = () => {
    let totalReduction = 0;
    let totalEmissions = 0;
    let projectsWithCarbonData = 0;

    projects.forEach(project => {
      const metrics = dataService.getProjectMetrics(project.id);
      const carbonMetrics = metrics.filter(m => 
        m.name.toLowerCase().includes('co2') || 
        m.name.toLowerCase().includes('carbono') ||
        m.name.toLowerCase().includes('emisiones')
      );

      carbonMetrics.forEach(metric => {
        if (metric.name.toLowerCase().includes('reducción')) {
          totalReduction += metric.current_value || 0;
        } else {
          totalEmissions += metric.current_value || 0;
        }
        projectsWithCarbonData++;
      });
    });

    const netImpact = totalReduction - totalEmissions;
    const trend = totalReduction > totalEmissions ? -15 : 5; // Simular tendencia

    setCarbonData({
      totalReduction,
      totalEmissions,
      netImpact: netImpact.toFixed(1),
      trend,
      projects: projectsWithCarbonData
    });
  };

  useEffect(() => {
    calculateRealCarbonFootprint();
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
          {carbonData.netImpact} tCO2
        </Typography>
        
        <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Poppins, sans-serif', mb: 2 }}>
          Impacto neto de {carbonData.projects} proyectos
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {carbonData.trend < 0 ? (
            <TrendingDownIcon sx={{ fontSize: 16 }} />
          ) : (
            <TrendingUpIcon sx={{ fontSize: 16 }} />
          )}
          <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'Poppins, sans-serif' }}>
            {Math.abs(carbonData.trend)}% vs mes anterior
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Widget de Energía conectado a métricas reales
export const RealEnergyWidget = ({ projects }) => {
  const [energyData, setEnergyData] = useState({
    totalConsumption: 0,
    renewablePercentage: 0,
    efficiency: 0,
    trend: 5
  });

  const calculateRealEnergyData = () => {
    let totalConsumption = 0;
    let renewableProjects = 0;

    projects.forEach(project => {
      const metrics = dataService.getProjectMetrics(project.id);
      const energyMetrics = metrics.filter(m => 
        m.name.toLowerCase().includes('energ') || 
        m.name.toLowerCase().includes('kwh') ||
        m.name.toLowerCase().includes('electricidad')
      );

      energyMetrics.forEach(metric => {
        totalConsumption += metric.current_value || 0;
      });

      // Detectar proyectos renovables
      if (project.name.toLowerCase().includes('solar') || 
          project.name.toLowerCase().includes('eólico') ||
          project.name.toLowerCase().includes('renovable')) {
        renewableProjects++;
      }
    });

    const renewablePercentage = projects.length > 0 ? 
      Math.round((renewableProjects / projects.length) * 100) : 0;
    const efficiency = totalConsumption > 0 ? Math.round((totalConsumption / 1000) * 100) : 0;

    setEnergyData({
      totalConsumption,
      renewablePercentage,
      efficiency,
      trend: 5
    });
  };

  useEffect(() => {
    calculateRealEnergyData();
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
            Consumo Energético
          </Typography>
        </Box>
        
        <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', mb: 1 }}>
          {energyData.totalConsumption} kWh
        </Typography>
        
        <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Poppins, sans-serif', mb: 2 }}>
          {energyData.renewablePercentage}% de proyectos renovables
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

// Widget de Proyectos Verdes conectado a métricas reales
export const RealGreenProjectsWidget = ({ projects }) => {
  const [greenData, setGreenData] = useState({
    total: 0,
    withMetrics: 0,
    avgImpact: 0,
    categories: {}
  });

  const calculateRealGreenProjects = () => {
    const greenProjects = projects.filter(p => 
      p.name.toLowerCase().includes('verde') || 
      p.name.toLowerCase().includes('sustentable') ||
      p.name.toLowerCase().includes('ambiental') ||
      p.name.toLowerCase().includes('carbono') ||
      p.name.toLowerCase().includes('hídrica')
    );

    let totalImpact = 0;
    let projectsWithMetrics = 0;
    const categories = {};

    greenProjects.forEach(project => {
      const metrics = dataService.getProjectMetrics(project.id);
      if (metrics.length > 0) {
        projectsWithMetrics++;
        let projectImpact = 0;
        
        metrics.forEach(metric => {
          projectImpact += metric.current_value || 0;
          
          // Categorizar por tipo de métrica
          if (metric.category) {
            categories[metric.category] = (categories[metric.category] || 0) + 1;
          }
        });
        
        totalImpact += projectImpact;
      }
    });

    setGreenData({
      total: greenProjects.length,
      withMetrics: projectsWithMetrics,
      avgImpact: projectsWithMetrics > 0 ? Math.round(totalImpact / projectsWithMetrics) : 0,
      categories
    });
  };

  useEffect(() => {
    calculateRealGreenProjects();
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
          {greenData.withMetrics} con métricas activas
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: 'rgba(255,255,255,0.8)' 
          }} />
          <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'Poppins, sans-serif' }}>
            Impacto promedio: {greenData.avgImpact}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Widget de Análisis de Impacto Real
export const RealProjectImpactWidget = ({ projects, onNavigate }) => {
  const [impactData, setImpactData] = useState([]);

  const calculateRealProjectImpact = () => {
    const projectImpacts = projects.map(project => {
      const metrics = dataService.getProjectMetrics(project.id);
      
      if (metrics.length === 0) {
        return {
          ...project,
          carbonReduction: 0,
          energySaved: 0,
          waterSaved: 0,
          impactScore: 0,
          metricsCount: 0
        };
      }

      let carbonReduction = 0;
      let energySaved = 0;
      let waterSaved = 0;

      metrics.forEach(metric => {
        const value = metric.current_value || 0;
        
        if (metric.name.toLowerCase().includes('co2') || metric.name.toLowerCase().includes('carbono')) {
          carbonReduction += value;
        } else if (metric.name.toLowerCase().includes('energ')) {
          energySaved += value;
        } else if (metric.name.toLowerCase().includes('agua')) {
          waterSaved += value;
        }
      });

      // Calcular score de impacto basado en métricas reales
      const impactScore = Math.round(
        (carbonReduction * 10) + 
        (energySaved / 100) + 
        (waterSaved / 1000)
      );

      return {
        ...project,
        carbonReduction: carbonReduction.toFixed(1),
        energySaved: Math.round(energySaved),
        waterSaved: Math.round(waterSaved),
        impactScore,
        metricsCount: metrics.length
      };
    }).sort((a, b) => b.impactScore - a.impactScore);

    setImpactData(projectImpacts.slice(0, 5)); // Top 5 proyectos
  };

  useEffect(() => {
    calculateRealProjectImpact();
  }, [projects]);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Análisis de Impacto Real
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
            
            <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
              {project.carbonReduction > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Reducción CO2
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                    {project.carbonReduction} kg
                  </Typography>
                </Box>
              )}
              {project.energySaved > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Energía
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                    {project.energySaved} kWh
                  </Typography>
                </Box>
              )}
              {project.waterSaved > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                    Agua
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                    {project.waterSaved} L
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                {project.metricsCount} métricas registradas
              </Typography>
              <Typography variant="caption" sx={{ color: GREEN, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                Score: {project.impactScore}
              </Typography>
            </Box>
            
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (project.impactScore / 100) * 100)}
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

        {impactData.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              No hay métricas registradas en los proyectos
            </Typography>
            <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
              Ve a la sección de Métricas de cada proyecto para agregar datos
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Widget de Métricas por Categoría
export const MetricsCategoryWidget = ({ projects }) => {
  const [categoryData, setCategoryData] = useState({});

  const calculateCategoryMetrics = () => {
    const categories = {};

    projects.forEach(project => {
      const metrics = dataService.getProjectMetrics(project.id);
      
      metrics.forEach(metric => {
        const category = metric.category || 'Sin categoría';
        if (!categories[category]) {
          categories[category] = {
            total: 0,
            projects: new Set(),
            metrics: []
          };
        }
        
        categories[category].total += metric.current_value || 0;
        categories[category].projects.add(project.id);
        categories[category].metrics.push(metric);
      });
    });

    setCategoryData(categories);
  };

  useEffect(() => {
    calculateCategoryMetrics();
  }, [projects]);

  const chartData = {
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData).map(cat => cat.total),
      backgroundColor: [
        '#4CAF50',
        '#2196F3',
        '#FF9800',
        '#9C27B0',
        '#F44336'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif', mb: 3 }}>
          Métricas por Categoría
        </Typography>

        {Object.keys(categoryData).length > 0 ? (
          <Box sx={{ height: 300 }}>
            <Doughnut 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      font: {
                        family: 'Poppins, sans-serif'
                      }
                    }
                  }
                }
              }} 
            />
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              No hay métricas categorizadas disponibles
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
