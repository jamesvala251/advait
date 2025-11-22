import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tabs,
  Tab,
  Divider
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Print as PrintIcon,
  FileDownload as FileDownloadIcon
} from "@mui/icons-material";
import { driverSalaryService, driverService } from "../services/api";

export default function DriverManagement() {
  const [driverSalaries, setDriverSalaries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Driver Salary Form Data
  const [formData, setFormData] = useState({
    driver_id: '',
    date: new Date().toISOString().split('T')[0], // Current date
    advanced_salary: '',
    remarks: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  
  // Filter state for driver salaries
  const [filters, setFilters] = useState({
    driver_name: '',
    date_from: '',
    date_to: '',
    salary_min: '',
    salary_max: '',
    remarks: ''
  });
  
  // Driver Management Form Data
  const [driverFormData, setDriverFormData] = useState({
    name: '',
    phone: '',
    license_number: '',
    address: '',
    status: 'active'
  });
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [deleteDriverDialog, setDeleteDriverDialog] = useState({ open: false, id: null });

  // Fetch drivers and driver salaries
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [driversResponse, salariesResponse] = await Promise.all([
        driverService.getAll(),
        driverSalaryService.getAll()
      ]);
      
      setDrivers(driversResponse.data || []);
      setDriverSalaries(salariesResponse.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDriverInputChange = (field) => (event) => {
    const value = event.target.value;
    setDriverFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (field) => (event) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.driver_id || !formData.date || !formData.advanced_salary) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const salaryData = {
        ...formData,
        advanced_salary: parseFloat(formData.advanced_salary)
      };

      if (editingId) {
        await driverSalaryService.update(editingId, salaryData);
        setSuccess('Driver salary updated successfully!');
      } else {
        await driverSalaryService.create(salaryData);
        setSuccess('Driver salary added successfully!');
      }

      // Reset form
      setFormData({
        driver_id: '',
        date: new Date().toISOString().split('T')[0],
        advanced_salary: '',
        remarks: ''
      });
      setEditingId(null);
      
      // Refresh data
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save driver salary. Please try again.');
      console.error('Error saving driver salary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (salary) => {
    setFormData({
      driver_id: salary.driver_id,
      date: salary.date,
      advanced_salary: salary.advanced_salary,
      remarks: salary.remarks || ''
    });
    setEditingId(salary.id);
  };

  const handleCancel = () => {
    setFormData({
      driver_id: '',
      date: new Date().toISOString().split('T')[0],
      advanced_salary: '',
      remarks: ''
    });
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await driverSalaryService.delete(deleteDialog.id);
      setSuccess('Driver salary deleted successfully!');
      setDeleteDialog({ open: false, id: null });
      await fetchData();
    } catch (err) {
      setError('Failed to delete driver salary. Please try again.');
      console.error('Error deleting driver salary:', err);
    } finally {
      setLoading(false);
    }
  };

  // Driver Management Functions
  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    
    if (!driverFormData.name || !driverFormData.phone || !driverFormData.license_number) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingDriverId) {
        await driverService.update(editingDriverId, driverFormData);
        setSuccess('Driver updated successfully!');
      } else {
        await driverService.create(driverFormData);
        setSuccess('Driver added successfully!');
      }

      // Reset form
      setDriverFormData({
        name: '',
        phone: '',
        license_number: '',
        address: '',
        status: 'active'
      });
      setEditingDriverId(null);
      
      // Refresh data
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save driver. Please try again.');
      console.error('Error saving driver:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDriverEdit = (driver) => {
    setDriverFormData({
      name: driver.name,
      phone: driver.phone,
      license_number: driver.license_number,
      address: driver.address || '',
      status: driver.status
    });
    setEditingDriverId(driver.id);
  };

  const handleDriverCancel = () => {
    setDriverFormData({
      name: '',
      phone: '',
      license_number: '',
      address: '',
      status: 'active'
    });
    setEditingDriverId(null);
    setError(null);
    setSuccess(null);
  };

  const handleDriverDelete = async () => {
    try {
      setLoading(true);
      await driverService.delete(deleteDriverDialog.id);
      setSuccess('Driver deleted successfully!');
      setDeleteDriverDialog({ open: false, id: null });
      await fetchData();
    } catch (err) {
      setError('Failed to delete driver. Please try again.');
      console.error('Error deleting driver:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Filter driver salaries based on filter criteria
  const filteredDriverSalaries = driverSalaries.filter(salary => {
    const driverName = getDriverName(salary.driver_id).toLowerCase();
    const salaryDate = new Date(salary.date);
    const salaryAmount = parseFloat(salary.advanced_salary);
    const salaryRemarks = (salary.remarks || '').toLowerCase();

    // Driver name filter
    const matchesDriverName = !filters.driver_name || 
      driverName.includes(filters.driver_name.toLowerCase());

    // Date range filter
    const matchesDateFrom = !filters.date_from || 
      salaryDate >= new Date(filters.date_from);
    const matchesDateTo = !filters.date_to || 
      salaryDate <= new Date(filters.date_to);

    // Salary range filter
    const matchesSalaryMin = !filters.salary_min || 
      salaryAmount >= parseFloat(filters.salary_min);
    const matchesSalaryMax = !filters.salary_max || 
      salaryAmount <= parseFloat(filters.salary_max);

    // Remarks filter
    const matchesRemarks = !filters.remarks || 
      salaryRemarks.includes(filters.remarks.toLowerCase());

    return matchesDriverName && matchesDateFrom && matchesDateTo && 
           matchesSalaryMin && matchesSalaryMax && matchesRemarks;
  });

  const clearFilters = () => {
    setFilters({
      driver_name: '',
      date_from: '',
      date_to: '',
      salary_min: '',
      salary_max: '',
      remarks: ''
    });
  };

  // Calculate totals for filtered results
  const filteredTotals = filteredDriverSalaries.reduce((acc, salary) => {
    acc.total_salary += parseFloat(salary.advanced_salary) || 0;
    acc.count += 1;
    return acc;
  }, { total_salary: 0, count: 0 });

  // Print functionality
  const printRecords = (records, title) => {
    const printContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #1976d2; margin-bottom: 10px; }
            .header p { color: #666; margin: 5px 0; }
            .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
            .summary-item { text-align: center; }
            .summary-value { font-size: 24px; font-weight: bold; color: #1976d2; }
            .summary-label { font-size: 12px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #1976d2; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .currency { text-align: right; }
            .date { text-align: center; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Driver Salary Records</h1>
            <p>Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}</p>
            <p>${title}</p>
          </div>
          
          <div class="summary">
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-value">${records.length}</div>
                <div class="summary-label">Total Records</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">₹${records.reduce((sum, r) => sum + parseFloat(r.advanced_salary || 0), 0).toLocaleString('en-IN')}</div>
                <div class="summary-label">Total Advance Salary</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">₹${records.length > 0 ? (records.reduce((sum, r) => sum + parseFloat(r.advanced_salary || 0), 0) / records.length).toLocaleString('en-IN', {maximumFractionDigits: 2}) : '0.00'}</div>
                <div class="summary-label">Average Salary</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${records.length > 0 ? new Date(Math.min(...records.map(r => new Date(r.date)))).toLocaleDateString('en-GB') : '-'}</div>
                <div class="summary-label">Earliest Date</div>
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Driver Name</th>
                <th class="date">Date</th>
                <th class="currency">Advance Salary</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${records.map(record => `
                <tr>
                  <td>${getDriverName(record.driver_id)}</td>
                  <td class="date">${formatDate(record.date)}</td>
                  <td class="currency">₹${parseFloat(record.advanced_salary).toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
                  <td>${record.remarks || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This report was generated from Advait Road Movers Driver Management System</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '', 'height=600,width=900');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const printAllRecords = () => {
    printRecords(driverSalaries, 'All Driver Salary Records');
  };

  const printFilteredRecords = () => {
    printRecords(filteredDriverSalaries, 'Filtered Driver Salary Records');
  };

  // CSV Export helper function
  const exportToCSV = (data, filename, headers) => {
    const csvContent = [
      headers,
      ...data.map(item => headers.map(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        if (key === 'driver_name') return getDriverName(item.driver_id);
        if (key === 'date') return formatDate(item.date);
        if (key === 'advanced_salary') return item.advanced_salary;
        if (key === 'remarks') return item.remarks || '';
        return item[key] || '';
      }))
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Driver Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Driver Salary Management" />
          <Tab label="Driver Management" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Tab Panel 0: Driver Salary Management */}
      {activeTab === 0 && (
        <>
          {/* Driver Salary Form */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              {editingId ? 'Edit Driver Salary' : 'Add New Driver Salary'}
            </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Driver Name</InputLabel>
                <Select
                  value={formData.driver_id}
                  onChange={handleInputChange('driver_id')}
                  label="Driver Name"
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={formData.date}
                onChange={handleInputChange('date')}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Advance Salary"
                  value={formData.advanced_salary}
                  onChange={handleInputChange('advanced_salary')}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Remarks"
                value={formData.remarks}
                onChange={handleInputChange('remarks')}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={editingId ? <EditIcon /> : <AddIcon />}
                  disabled={loading}
                >
                  {editingId ? 'Update' : 'Save'}
                </Button>
                
                {editingId && (
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
          </Paper>

          {/* Filter Section */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom>
              Filter Records
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Driver Name"
                  value={filters.driver_name}
                  onChange={handleFilterChange('driver_name')}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="From Date"
                  value={filters.date_from}
                  onChange={handleFilterChange('date_from')}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="To Date"
                  value={filters.date_to}
                  onChange={handleFilterChange('date_to')}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Salary"
                  value={filters.salary_min}
                  onChange={handleFilterChange('salary_min')}
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Salary"
                  value={filters.salary_max}
                  onChange={handleFilterChange('salary_max')}
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Remarks"
                  value={filters.remarks}
                  onChange={handleFilterChange('remarks')}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Typography variant="body2" sx={{ alignSelf: 'center', mr: 1 }}>
                    Quick Filters:
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const today = new Date();
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                      setFilters(prev => ({
                        ...prev,
                        date_from: firstDay.toISOString().split('T')[0],
                        date_to: today.toISOString().split('T')[0]
                      }));
                    }}
                  >
                    This Month
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const today = new Date();
                      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
                      setFilters(prev => ({
                        ...prev,
                        date_from: lastMonth.toISOString().split('T')[0],
                        date_to: lastDay.toISOString().split('T')[0]
                      }));
                    }}
                  >
                    Last Month
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const today = new Date();
                      const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                      setFilters(prev => ({
                        ...prev,
                        date_from: last7Days.toISOString().split('T')[0],
                        date_to: today.toISOString().split('T')[0]
                      }));
                    }}
                  >
                    Last 7 Days
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        salary_min: '1000',
                        salary_max: '5000'
                      }));
                    }}
                  >
                    Salary ₹1K-5K
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.entries(filters).map(([key, value]) => {
                      if (!value) return null;
                      const labels = {
                        driver_name: 'Driver',
                        date_from: 'From Date',
                        date_to: 'To Date',
                        salary_min: 'Min Salary',
                        salary_max: 'Max Salary',
                        remarks: 'Remarks'
                      };
                      return (
                        <Chip
                          key={key}
                          label={`${labels[key]}: ${value}`}
                          onDelete={() => handleFilterChange(key)({ target: { value: '' } })}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      );
                    })}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={clearFilters}
                      size="small"
                      disabled={!Object.values(filters).some(value => value)}
                    >
                      Clear All
                    </Button>
                    {filteredDriverSalaries.length > 0 && (
                      <>
                        <Button
                          variant="contained"
                          onClick={printFilteredRecords}
                          size="small"
                          startIcon={<PrintIcon />}
                          color="primary"
                        >
                          Print Filtered ({filteredDriverSalaries.length})
                        </Button>
                        
                        <Button
                          variant="contained"
                          onClick={() => exportToCSV(
                            filteredDriverSalaries, 
                            `filtered_driver_salaries_${new Date().toISOString().split('T')[0]}.csv`,
                            ['Driver Name', 'Date', 'Advance Salary', 'Remarks']
                          )}
                          size="small"
                          startIcon={<FileDownloadIcon />}
                          color="secondary"
                        >
                          Export CSV ({filteredDriverSalaries.length})
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Driver Salaries List */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Driver Salary Records
              {filteredDriverSalaries.length !== driverSalaries.length && (
                <Chip 
                  label={`${filteredDriverSalaries.length} of ${driverSalaries.length} records`}
                  color="primary"
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {driverSalaries.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={printAllRecords}
                    startIcon={<PrintIcon />}
                  >
                    Print All
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => exportToCSV(
                      driverSalaries, 
                      `all_driver_salaries_${new Date().toISOString().split('T')[0]}.csv`,
                      ['Driver Name', 'Date', 'Advance Salary', 'Remarks']
                    )}
                    startIcon={<FileDownloadIcon />}
                  >
                    Export All CSV
                  </Button>
                </>
              )}
              
              {filteredDriverSalaries.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={printFilteredRecords}
                    startIcon={<PrintIcon />}
                    disabled={filteredDriverSalaries.length === driverSalaries.length}
                  >
                    Print Filtered
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => exportToCSV(
                      filteredDriverSalaries, 
                      `filtered_driver_salaries_${new Date().toISOString().split('T')[0]}.csv`,
                      ['Driver Name', 'Date', 'Advance Salary', 'Remarks']
                    )}
                    startIcon={<FileDownloadIcon />}
                    disabled={filteredDriverSalaries.length === driverSalaries.length}
                  >
                    Export Filtered CSV
                  </Button>
                </>
              )}
            </Box>
          </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Driver Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Advance Salary</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDriverSalaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {driverSalaries.length === 0 ? 'No driver salary records found' : 'No records match the current filters'}
                </TableCell>
              </TableRow>
            ) : (
              filteredDriverSalaries.map((salary) => (
                <TableRow key={salary.id}>
                  <TableCell>
                    <Chip 
                      label={getDriverName(salary.driver_id)} 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDate(salary.date)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(salary.advanced_salary)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {salary.remarks || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(salary)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteDialog({ open: true, id: salary.id })}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Summary Section */}
      {filteredDriverSalaries.length > 0 && (
        <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {filteredTotals.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Records
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(filteredTotals.total_salary)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Advance Salary
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {filteredTotals.count > 0 ? formatCurrency(filteredTotals.total_salary / filteredTotals.count) : '₹0.00'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Salary
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {filteredDriverSalaries.length > 0 ? 
                    formatDate(Math.min(...filteredDriverSalaries.map(s => new Date(s.date)))) : 
                    '-'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Earliest Date
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialog.open}
            onClose={() => setDeleteDialog({ open: false, id: null })}
          >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              Are you sure you want to delete this driver salary record? This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
                Cancel
              </Button>
              <Button onClick={handleDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {/* Tab Panel 1: Driver Management */}
      {activeTab === 1 && (
        <>
          {/* Driver Form */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              {editingDriverId ? 'Edit Driver' : 'Add New Driver'}
            </Typography>
            
            <form onSubmit={handleDriverSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driver Name"
                    value={driverFormData.name}
                    onChange={handleDriverInputChange('name')}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={driverFormData.phone}
                    onChange={handleDriverInputChange('phone')}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="License Number"
                    value={driverFormData.license_number}
                    onChange={handleDriverInputChange('license_number')}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={driverFormData.status}
                      onChange={handleDriverInputChange('status')}
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={driverFormData.address}
                    onChange={handleDriverInputChange('address')}
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={editingDriverId ? <EditIcon /> : <AddIcon />}
                      disabled={loading}
                    >
                      {editingDriverId ? 'Update Driver' : 'Add Driver'}
                    </Button>
                    
                    {editingDriverId && (
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleDriverCancel}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>

          {/* Drivers List */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Driver Records
            </Typography>
            
            {drivers.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const printContent = `
                      <html>
                        <head>
                          <title>Driver Records</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .header h1 { color: #1976d2; margin-bottom: 10px; }
                            .header p { color: #666; margin: 5px 0; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                            th { background-color: #1976d2; color: white; font-weight: bold; }
                            tr:nth-child(even) { background-color: #f9f9f9; }
                            .status { text-align: center; }
                            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>Driver Records</h1>
                            <p>Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}</p>
                            <p>Total Drivers: ${drivers.length}</p>
                          </div>
                          
                          <table>
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>License Number</th>
                                <th class="status">Status</th>
                                <th>Address</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${drivers.map(driver => `
                                <tr>
                                  <td>${driver.name}</td>
                                  <td>${driver.phone}</td>
                                  <td>${driver.license_number}</td>
                                  <td class="status">${driver.status}</td>
                                  <td>${driver.address || '-'}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>
                          
                          <div class="footer">
                            <p>This report was generated from Advait Road Movers Driver Management System</p>
                          </div>
                        </body>
                      </html>
                    `;
                    
                    const printWindow = window.open('', '', 'height=600,width=900');
                    printWindow.document.write(printContent);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                  }}
                  startIcon={<PrintIcon />}
                >
                  Print Drivers
                </Button>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const csvContent = [
                      ['Name', 'Phone', 'License Number', 'Status', 'Address'],
                      ...drivers.map(driver => [
                        driver.name,
                        driver.phone,
                        driver.license_number,
                        driver.status,
                        driver.address || ''
                      ])
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `drivers_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  startIcon={<FileDownloadIcon />}
                >
                  Export Drivers CSV
                </Button>
              </Box>
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>License Number</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No drivers found
                    </TableCell>
                  </TableRow>
                ) : (
                  drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {driver.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{driver.phone}</TableCell>
                      <TableCell>{driver.license_number}</TableCell>
                      <TableCell>
                        <Chip 
                          label={driver.status} 
                          color={driver.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {driver.address || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleDriverEdit(driver)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteDriverDialog({ open: true, id: driver.id })}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Delete Driver Confirmation Dialog */}
          <Dialog
            open={deleteDriverDialog.open}
            onClose={() => setDeleteDriverDialog({ open: false, id: null })}
          >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              Are you sure you want to delete this driver? This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDriverDialog({ open: false, id: null })}>
                Cancel
              </Button>
              <Button onClick={handleDriverDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Paper>
  );
}
