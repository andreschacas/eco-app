import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import dataService from '../../utils/dataService';
import { useAuth } from '../../context/auth/AuthContext';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const GREEN = '#2AAC26';

const ProjectFinancialTab = ({ projectId }) => {
  const { user } = useAuth();
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [budgetForm, setBudgetForm] = useState({
    name: '',
    allocated_amount: '',
    currency: 'USD'
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category_name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    receipt_number: ''
  });

  useEffect(() => {
    loadFinancialData();
  }, [projectId]);

  const loadFinancialData = () => {
    try {
      const projectBudget = dataService.getBudgetByProject(projectId);
      const projectExpenses = dataService.getExpensesByProject(projectId);
      const categories = dataService.getAll('expense_categories');
      const summary = dataService.getProjectFinancialSummary(projectId);

      setBudget(projectBudget);
      setExpenses(projectExpenses);
      setExpenseCategories(categories);
      setFinancialSummary(summary);
    } catch (error) {
      console.error('Error loading financial data:', error);
      showSnackbar('Error al cargar los datos financieros', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateBudget = () => {
    setEditingBudget(null);
    setBudgetForm({
      name: '',
      allocated_amount: '',
      currency: 'USD'
    });
    setOpenBudgetDialog(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      name: budget.name,
      allocated_amount: budget.allocated_amount,
      currency: budget.currency
    });
    setOpenBudgetDialog(true);
  };

  const handleSaveBudget = () => {
    try {
      const budgetData = {
        project_id: projectId,
        name: budgetForm.name,
        allocated_amount: parseFloat(budgetForm.allocated_amount),
        spent_amount: editingBudget ? editingBudget.spent_amount : 0,
        currency: budgetForm.currency,
        status: 'active'
      };

      if (editingBudget) {
        dataService.update('budgets', editingBudget.id, budgetData);
        showSnackbar('Presupuesto actualizado correctamente', 'success');
      } else {
        dataService.createBudget(budgetData);
        showSnackbar('Presupuesto creado correctamente', 'success');
      }

      setOpenBudgetDialog(false);
      loadFinancialData();
    } catch (error) {
      console.error('Error saving budget:', error);
      showSnackbar('Error al guardar el presupuesto', 'error');
    }
  };

  const handleCreateExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      amount: '',
      category_name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      vendor: '',
      receipt_number: ''
    });
    setOpenExpenseDialog(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      amount: expense.amount,
      category_name: expense.category_name || getCategoryName(expense.category_id),
      description: expense.description,
      date: expense.date,
      vendor: expense.vendor,
      receipt_number: expense.receipt_number
    });
    setOpenExpenseDialog(true);
  };

  const handleSaveExpense = () => {
    try {
      const expenseData = {
        budget_id: budget?.id,
        project_id: projectId,
        amount: parseFloat(expenseForm.amount),
        category_name: expenseForm.category_name,
        description: expenseForm.description,
        date: expenseForm.date,
        approved_by: user.id,
        status: 'approved',
        vendor: expenseForm.vendor,
        receipt_number: expenseForm.receipt_number
      };

      if (editingExpense) {
        dataService.update('expenses', editingExpense.id, expenseData);
        showSnackbar('Gasto actualizado correctamente', 'success');
      } else {
        dataService.createExpense(expenseData);
        showSnackbar('Gasto registrado correctamente', 'success');
      }

      setOpenExpenseDialog(false);
      loadFinancialData();
    } catch (error) {
      console.error('Error saving expense:', error);
      showSnackbar('Error al guardar el gasto', 'error');
    }
  };

  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      try {
        dataService.delete('expenses', expenseId);
        showSnackbar('Gasto eliminado correctamente', 'success');
        loadFinancialData();
      } catch (error) {
        console.error('Error deleting expense:', error);
        showSnackbar('Error al eliminar el gasto', 'error');
      }
    }
  };

  const getCategoryName = (categoryId, categoryName) => {
    // Si hay category_name, usarlo directamente
    if (categoryName) {
      return categoryName;
    }
    // Si no, buscar por ID en las categorías predefinidas
    const category = expenseCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  const getCategoryIcon = (categoryId) => {
    const category = expenseCategories.find(c => c.id === categoryId);
    return category ? category.icon : '📦';
  };

  const getCategoryColor = (categoryId, categoryName) => {
    // Si hay category_name, generar un color basado en el nombre
    if (categoryName) {
      const colorPalette = ['#2AAC26', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688'];
      const hash = categoryName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colorPalette[hash % colorPalette.length];
    }
    // Si no, buscar por ID en las categorías predefinidas
    const category = expenseCategories.find(c => c.id === categoryId);
    return category ? category.color : '#9e9e9e';
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getBudgetComplianceColor = (percentage) => {
    if (percentage <= 70) return GREEN;
    if (percentage <= 90) return '#ff9800';
    return '#f44336';
  };

  const getBudgetComplianceStatus = (percentage) => {
    if (percentage <= 70) return 'Excelente';
    if (percentage <= 90) return 'Bueno';
    return 'Crítico';
  };

  // Datos para el gráfico de dona
  const getDonutChartData = () => {
    if (!financialSummary?.expensesByCategory) return null;

    const categories = Object.keys(financialSummary.expensesByCategory);
    
    // Validar que hay categorías y que tienen valores mayores a 0
    const validCategories = categories.filter(categoryName => {
      const value = financialSummary.expensesByCategory[categoryName];
      return value && value > 0;
    });

    if (validCategories.length === 0) return null;

    const data = validCategories.map(categoryName => financialSummary.expensesByCategory[categoryName]);
    const labels = validCategories;
    
    // Generar colores automáticamente para las categorías
    const colors = validCategories.map((_, index) => {
      const colorPalette = ['#2AAC26', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688'];
      return colorPalette[index % colorPalette.length];
    });

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  // Función para validar si se debe mostrar el gráfico
  const shouldShowDonutChart = () => {
    if (!financialSummary?.expensesByCategory) return false;
    
    const categories = Object.keys(financialSummary.expensesByCategory);
    const hasValidData = categories.some(categoryName => {
      const value = financialSummary.expensesByCategory[categoryName];
      return value && value > 0;
    });
    
    return hasValidData;
  };

  const canManageFinances = user?.role === 'Administrador' || user?.role === 'Coordinador';

  if (!budget && !canManageFinances) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <AccountBalanceWalletIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
          Este proyecto no tiene presupuesto asignado
        </Typography>
        <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
          Contacta al administrador para configurar el presupuesto del proyecto
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con acciones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
          Gestión Financiera del Proyecto
        </Typography>
        {canManageFinances && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!budget && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateBudget}
                sx={{
                  bgcolor: GREEN,
                  '&:hover': { bgcolor: '#1f9a1f' },
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'none'
                }}
              >
                Crear Presupuesto
              </Button>
            )}
            {budget && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleCreateExpense}
                sx={{
                  borderColor: GREEN,
                  color: GREEN,
                  '&:hover': { borderColor: '#1f9a1f', bgcolor: '#e8f5e9' },
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'none'
                }}
              >
                Registrar Gasto
              </Button>
            )}
          </Box>
        )}
      </Box>

      {budget ? (
        <Grid container spacing={3}>
          {/* Primera fila: KPIs Principales */}
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <AccountBalanceWalletIcon sx={{ color: GREEN, fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      Presupuesto Total
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
                      {formatCurrency(budget.allocated_amount, budget.currency)}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: GREEN,
                      borderRadius: 3
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <TrendingDownIcon sx={{ color: '#f44336', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      Gastado
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336', fontFamily: 'Poppins, sans-serif' }}>
                      {formatCurrency(financialSummary?.totalSpent || 0, budget.currency)}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={financialSummary?.budgetCompliance || 0}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getBudgetComplianceColor(financialSummary?.budgetCompliance || 0),
                      borderRadius: 3
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      Disponible
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', fontFamily: 'Poppins, sans-serif' }}>
                      {formatCurrency(financialSummary?.remaining || 0, budget.currency)}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={100 - (financialSummary?.budgetCompliance || 0)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#4caf50',
                      borderRadius: 3
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <ReceiptIcon sx={{ color: '#2196f3', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      Cumplimiento
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3', fontFamily: 'Poppins, sans-serif' }}>
                      {(financialSummary?.budgetCompliance || 0).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={getBudgetComplianceStatus(financialSummary?.budgetCompliance || 0)}
                  sx={{
                    bgcolor: getBudgetComplianceColor(financialSummary?.budgetCompliance || 0),
                    color: 'white',
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Segunda fila: Gráfico de dona y Gastos Recientes - Ahora en una fila separada */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif', mb: 3 }}>
                  Gastos por Categoría
                </Typography>
                {shouldShowDonutChart() ? (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Doughnut
                      data={getDonutChartData()}
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
                    <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                      {expenses.length > 0 ? 'Los gastos aún no tienen categorías asignadas' : 'No hay gastos registrados aún'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mt: 1 }}>
                      {expenses.length > 0 ? 'Edita los gastos para asignarles categorías y ver el análisis' : 'Registra gastos para ver el análisis por categorías'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Lista de Gastos Recientes */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif', mb: 3 }}>
                  Gastos Recientes
                </Typography>
                {expenses.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Fecha</TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Descripción</TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Categoría</TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Monto</TableCell>
                          {canManageFinances && (
                            <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Acciones</TableCell>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {expenses.slice(0, 5).map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>
                              {new Date(expense.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>
                              {expense.description}
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<span>{getCategoryIcon(expense.category_id)}</span>}
                                label={getCategoryName(expense.category_id, expense.category_name)}
                                size="small"
                                sx={{
                                  bgcolor: getCategoryColor(expense.category_id, expense.category_name),
                                  color: 'white',
                                  fontFamily: 'Poppins, sans-serif',
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                              {formatCurrency(expense.amount, budget.currency)}
                            </TableCell>
                            {canManageFinances && (
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditExpense(expense)}
                                  sx={{ color: GREEN }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  sx={{ color: '#f44336' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                      No hay gastos registrados aún
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif', mb: 1 }}>
              No hay presupuesto configurado
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif', mb: 3 }}>
              Crea un presupuesto para comenzar a gestionar los gastos del proyecto
            </Typography>
            {canManageFinances && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateBudget}
                sx={{
                  bgcolor: GREEN,
                  '&:hover': { bgcolor: '#1f9a1f' },
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'none'
                }}
              >
                Crear Presupuesto
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog para crear/editar presupuesto */}
      <Dialog open={openBudgetDialog} onClose={() => setOpenBudgetDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          {editingBudget ? 'Editar Presupuesto' : 'Crear Presupuesto'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre del Presupuesto"
            value={budgetForm.name}
            onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
            margin="normal"
            sx={{ fontFamily: 'Poppins, sans-serif' }}
          />
          <TextField
            fullWidth
            label="Presupuesto Total"
            type="number"
            value={budgetForm.allocated_amount}
            onChange={(e) => setBudgetForm({ ...budgetForm, allocated_amount: e.target.value })}
            margin="normal"
            sx={{ fontFamily: 'Poppins, sans-serif' }}
            inputProps={{ min: "0", step: "0.01" }}
          />
           <Box sx={{ mt: 2, mb: 1 }}>
             <Typography variant="body1" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
               Moneda
             </Typography>
             <RadioGroup
               value={budgetForm.currency}
               onChange={(e) => setBudgetForm({ ...budgetForm, currency: e.target.value })}
               sx={{ fontFamily: 'Poppins, sans-serif' }}
             >
               <FormControlLabel 
                 value="USD" 
                 control={<Radio sx={{ color: GREEN }} />} 
                 label="USD - Dólar Americano" 
                 sx={{ fontFamily: 'Poppins, sans-serif' }}
               />
               <FormControlLabel 
                 value="EUR" 
                 control={<Radio sx={{ color: GREEN }} />} 
                 label="EUR - Euro" 
                 sx={{ fontFamily: 'Poppins, sans-serif' }}
               />
               <FormControlLabel 
                 value="COP" 
                 control={<Radio sx={{ color: GREEN }} />} 
                 label="COP - Peso Colombiano" 
                 sx={{ fontFamily: 'Poppins, sans-serif' }}
               />
             </RadioGroup>
           </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBudgetDialog(false)} sx={{ fontFamily: 'Poppins, sans-serif' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveBudget}
            variant="contained"
            sx={{
              bgcolor: GREEN,
              '&:hover': { bgcolor: '#1f9a1f' },
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'none'
            }}
          >
            {editingBudget ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear/editar gasto */}
      <Dialog open={openExpenseDialog} onClose={() => setOpenExpenseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          {editingExpense ? 'Editar Gasto' : 'Registrar Gasto'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Monto"
            type="number"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            margin="normal"
            sx={{ fontFamily: 'Poppins, sans-serif' }}
          />
          <TextField
            fullWidth
            label="Categoría"
            value={expenseForm.category_name || ''}
            onChange={(e) => setExpenseForm({ ...expenseForm, category_name: e.target.value })}
            margin="normal"
            sx={{ fontFamily: 'Poppins, sans-serif' }}
            placeholder="Ej: Materiales, Equipos, Servicios, etc."
          />
          <TextField
            fullWidth
            label="Descripción"
            multiline
            rows={3}
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            margin="normal"
            sx={{ fontFamily: 'Poppins, sans-serif' }}
          />
          <TextField
            fullWidth
            label="Fecha"
            type="date"
            value={expenseForm.date}
            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            sx={{ fontFamily: 'Poppins, sans-serif' }}
          />
          <TextField
            fullWidth
            label="Proveedor"
            value={expenseForm.vendor}
            onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
            margin="normal"
            sx={{ fontFamily: 'Poppins, sans-serif' }}
          />
          <TextField
            fullWidth
            label="Número de Recibo"
            value={expenseForm.receipt_number}
            onChange={(e) => setExpenseForm({ ...expenseForm, receipt_number: e.target.value })}
            margin="normal"
            sx={{ fontFamily: 'Poppins, sans-serif' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExpenseDialog(false)} sx={{ fontFamily: 'Poppins, sans-serif' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveExpense}
            variant="contained"
            sx={{
              bgcolor: GREEN,
              '&:hover': { bgcolor: '#1f9a1f' },
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'none'
            }}
          >
            {editingExpense ? 'Actualizar' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectFinancialTab;
