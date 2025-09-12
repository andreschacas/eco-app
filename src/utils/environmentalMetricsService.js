// Servicio para extraer y calcular métricas ambientales de los proyectos
import dataService from './dataService';

class EnvironmentalMetricsService {
  constructor() {
    this.environmentalKeywords = {
      carbon: ['carbono', 'co2', 'emisiones', 'huella', 'clima', 'gases'],
      water: ['agua', 'hídrica', 'hidrica', 'potable', 'saneamiento', 'riego'],
      energy: ['energía', 'energia', 'solar', 'eólico', 'eolico', 'renovable', 'electricidad'],
      waste: ['residuos', 'basura', 'reciclaje', 'desechos', 'compostaje'],
      biodiversity: ['biodiversidad', 'verde', 'ecosistema', 'naturaleza', 'flora', 'fauna'],
      sustainability: ['sustentable', 'sostenible', 'eco', 'ambiental', 'verde']
    };
  }

  // Obtener todas las métricas ambientales de un proyecto
  getProjectEnvironmentalMetrics(projectId) {
    const projectMetrics = dataService.getProjectMetrics(projectId);
    
    return projectMetrics.filter(metric => {
      const metricName = metric.name.toLowerCase();
      const metricDescription = (metric.description || '').toLowerCase();
      
      // Verificar si la métrica es ambiental
      return Object.values(this.environmentalKeywords).some(keywords => 
        keywords.some(keyword => 
          metricName.includes(keyword) || metricDescription.includes(keyword)
        )
      );
    });
  }

  // Obtener métricas ambientales de todos los proyectos
  getAllEnvironmentalMetrics() {
    const projects = dataService.getAll('projects');
    const allMetrics = [];

    projects.forEach(project => {
      const projectMetrics = this.getProjectEnvironmentalMetrics(project.id);
      projectMetrics.forEach(metric => {
        allMetrics.push({
          ...metric,
          project_name: project.name,
          project_status: project.status
        });
      });
    });

    return allMetrics;
  }

  // Calcular huella de carbono total basada en métricas reales
  calculateTotalCarbonFootprint(projects = null) {
    const targetProjects = projects || dataService.getAll('projects');
    let totalCarbonReduction = 0;
    let totalCarbonEmissions = 0;

    targetProjects.forEach(project => {
      const projectMetrics = this.getProjectEnvironmentalMetrics(project.id);
      
      projectMetrics.forEach(metric => {
        const metricName = metric.name.toLowerCase();
        
        if (metricName.includes('reducción') && metricName.includes('co2')) {
          totalCarbonReduction += parseFloat(metric.current_value || 0);
        } else if (metricName.includes('emisiones') && metricName.includes('co2')) {
          totalCarbonEmissions += parseFloat(metric.current_value || 0);
        }
      });
    });

    return {
      reduction: totalCarbonReduction,
      emissions: totalCarbonEmissions,
      net: totalCarbonReduction - totalCarbonEmissions
    };
  }

  // Calcular energía renovable basada en métricas reales
  calculateRenewableEnergy(projects = null) {
    const targetProjects = projects || dataService.getAll('projects');
    let totalRenewableEnergy = 0;
    let totalEnergyConsumption = 0;

    targetProjects.forEach(project => {
      const projectMetrics = this.getProjectEnvironmentalMetrics(project.id);
      
      projectMetrics.forEach(metric => {
        const metricName = metric.name.toLowerCase();
        
        if (metricName.includes('renovable') || metricName.includes('solar') || metricName.includes('eólico')) {
          totalRenewableEnergy += parseFloat(metric.current_value || 0);
        } else if (metricName.includes('energía') || metricName.includes('kwh') || metricName.includes('electricidad')) {
          totalEnergyConsumption += parseFloat(metric.current_value || 0);
        }
      });
    });

    const percentage = totalEnergyConsumption > 0 ? 
      (totalRenewableEnergy / totalEnergyConsumption) * 100 : 0;

    return {
      renewable: totalRenewableEnergy,
      total: totalEnergyConsumption,
      percentage: Math.min(100, percentage)
    };
  }

  // Calcular proyectos verdes basado en métricas ambientales
  calculateGreenProjects(projects = null) {
    const targetProjects = projects || dataService.getAll('projects');
    const greenProjects = [];

    targetProjects.forEach(project => {
      const projectMetrics = this.getProjectEnvironmentalMetrics(project.id);
      
      // Un proyecto es "verde" si tiene métricas ambientales
      if (projectMetrics.length > 0) {
        const totalImpact = projectMetrics.reduce((sum, metric) => {
          return sum + parseFloat(metric.current_value || 0);
        }, 0);

        greenProjects.push({
          ...project,
          environmental_metrics_count: projectMetrics.length,
          total_impact: totalImpact,
          metrics: projectMetrics
        });
      }
    });

    return greenProjects.sort((a, b) => b.total_impact - a.total_impact);
  }

  // Obtener métricas para tracking de emisiones en tiempo real
  getRealtimeEmissionsData() {
    const allMetrics = this.getAllEnvironmentalMetrics();
    const emissionMetrics = allMetrics.filter(metric => {
      const metricName = metric.name.toLowerCase();
      return metricName.includes('emisiones') || metricName.includes('co2');
    });

    // Simular datos en tiempo real basados en métricas actuales
    const now = new Date();
    const hourlyData = [];

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseEmission = emissionMetrics.reduce((sum, metric) => {
        return sum + (parseFloat(metric.current_value || 0) / 24); // Dividir por 24 horas
      }, 0);

      // Agregar variación aleatoria para simular tiempo real
      const variation = (Math.random() - 0.5) * 0.2;
      const currentEmission = Math.max(0, baseEmission + variation);

      hourlyData.push({
        time: hour.getHours() + ':00',
        emissions: currentEmission,
        source: 'project_metrics'
      });
    }

    return hourlyData;
  }

  // Calcular progreso de SDGs basado en métricas reales
  calculateSDGProgress(projects = null) {
    const targetProjects = projects || dataService.getAll('projects');
    const sdgMetrics = {
      6: { name: 'Agua Limpia y Saneamiento', color: '#00AED9', metrics: 0, projects: 0 },
      7: { name: 'Energía Asequible y No Contaminante', color: '#FDB713', metrics: 0, projects: 0 },
      11: { name: 'Ciudades y Comunidades Sostenibles', color: '#FD9D24', metrics: 0, projects: 0 },
      13: { name: 'Acción por el Clima', color: '#3F7E44', metrics: 0, projects: 0 },
      15: { name: 'Vida de Ecosistemas Terrestres', color: '#56C02B', metrics: 0, projects: 0 }
    };

    targetProjects.forEach(project => {
      const projectMetrics = this.getProjectEnvironmentalMetrics(project.id);
      
      projectMetrics.forEach(metric => {
        const metricName = metric.name.toLowerCase();
        const projectName = project.name.toLowerCase();
        
        // SDG 6: Agua
        if (metricName.includes('agua') || metricName.includes('hídrica') || 
            projectName.includes('agua') || projectName.includes('hídrica')) {
          sdgMetrics[6].metrics += parseFloat(metric.current_value || 0);
          sdgMetrics[6].projects += 1;
        }
        
        // SDG 7: Energía
        if (metricName.includes('energía') || metricName.includes('solar') || metricName.includes('eólico') ||
            projectName.includes('energía') || projectName.includes('solar') || projectName.includes('eólico')) {
          sdgMetrics[7].metrics += parseFloat(metric.current_value || 0);
          sdgMetrics[7].projects += 1;
        }
        
        // SDG 11: Ciudades
        if (metricName.includes('urbano') || metricName.includes('ciudad') || metricName.includes('comunidad') ||
            projectName.includes('urbano') || projectName.includes('ciudad') || projectName.includes('comunidad')) {
          sdgMetrics[11].metrics += parseFloat(metric.current_value || 0);
          sdgMetrics[11].projects += 1;
        }
        
        // SDG 13: Clima
        if (metricName.includes('carbono') || metricName.includes('clima') || metricName.includes('emisiones') ||
            projectName.includes('carbono') || projectName.includes('clima') || projectName.includes('emisiones')) {
          sdgMetrics[13].metrics += parseFloat(metric.current_value || 0);
          sdgMetrics[13].projects += 1;
        }
        
        // SDG 15: Ecosistemas
        if (metricName.includes('biodiversidad') || metricName.includes('ecosistema') || metricName.includes('verde') ||
            projectName.includes('biodiversidad') || projectName.includes('ecosistema') || projectName.includes('verde')) {
          sdgMetrics[15].metrics += parseFloat(metric.current_value || 0);
          sdgMetrics[15].projects += 1;
        }
      });
    });

    // Calcular progreso basado en métricas y proyectos
    Object.keys(sdgMetrics).forEach(sdgId => {
      const sdg = sdgMetrics[sdgId];
      const progress = Math.min(100, (sdg.projects * 10) + (sdg.metrics / 100));
      sdg.progress = Math.round(progress);
    });

    return Object.entries(sdgMetrics).map(([id, data]) => ({
      id: parseInt(id),
      ...data
    }));
  }

  // Obtener análisis de impacto detallado por proyecto
  getProjectImpactAnalysis(projects = null) {
    const targetProjects = projects || dataService.getAll('projects');
    const impactAnalysis = [];

    targetProjects.forEach(project => {
      const projectMetrics = this.getProjectEnvironmentalMetrics(project.id);
      
      if (projectMetrics.length > 0) {
        let carbonReduction = 0;
        let energySaved = 0;
        let waterSaved = 0;
        let wasteReduced = 0;

        projectMetrics.forEach(metric => {
          const metricName = metric.name.toLowerCase();
          const value = parseFloat(metric.current_value || 0);
          
          if (metricName.includes('reducción') && metricName.includes('co2')) {
            carbonReduction += value;
          } else if (metricName.includes('energía') && metricName.includes('ahorro')) {
            energySaved += value;
          } else if (metricName.includes('agua') && metricName.includes('ahorro')) {
            waterSaved += value;
          } else if (metricName.includes('residuos') && metricName.includes('reducción')) {
            wasteReduced += value;
          }
        });

        const impactScore = (carbonReduction * 10) + (energySaved / 100) + (waterSaved / 1000) + (wasteReduced * 5);

        impactAnalysis.push({
          ...project,
          carbonReduction: carbonReduction.toFixed(1),
          energySaved: Math.round(energySaved),
          waterSaved: Math.round(waterSaved),
          wasteReduced: Math.round(wasteReduced),
          impactScore: Math.round(impactScore),
          environmentalMetricsCount: projectMetrics.length
        });
      }
    });

    return impactAnalysis.sort((a, b) => b.impactScore - a.impactScore);
  }

  // Obtener métricas para la calculadora de huella de carbono
  getCarbonCalculatorData() {
    const allMetrics = this.getAllEnvironmentalMetrics();
    const carbonMetrics = allMetrics.filter(metric => {
      const metricName = metric.name.toLowerCase();
      return metricName.includes('carbono') || metricName.includes('co2');
    });

    const totalCarbon = carbonMetrics.reduce((sum, metric) => {
      return sum + parseFloat(metric.current_value || 0);
    }, 0);

    return {
      totalCarbon: totalCarbon.toFixed(2),
      projectCount: carbonMetrics.length,
      averagePerProject: carbonMetrics.length > 0 ? (totalCarbon / carbonMetrics.length).toFixed(2) : 0,
      metrics: carbonMetrics
    };
  }
}

export default new EnvironmentalMetricsService();
