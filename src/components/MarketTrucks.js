import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Checkbox
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { marketTruckService } from '../services/api';

const MarketTrucks = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    truckNumber: '',
    startDate: '',
    endDate: '',
    month: new Date().toISOString().slice(0, 7) // Default to current month (YYYY-MM)
  });
  const [selectedTrucks, setSelectedTrucks] = useState([]);

  // Fetch trucks data
  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const response = await marketTruckService.getAll();
      setTrucks(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch market trucks. Please try again.');
      console.error('Error fetching market trucks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter trucks based on selected criteria
  const filteredTrucks = trucks.filter(truck => {
    const matchesTruck = !filters.truckNumber || truck.truck_number === filters.truckNumber;
    const matchesStartDate = !filters.startDate || new Date(truck.start_date) >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || new Date(truck.end_date) <= new Date(filters.endDate);
    
    // Add month filter
    const matchesMonth = !filters.month || 
      (truck.start_date && truck.start_date.startsWith(filters.month)) ||
      (truck.end_date && truck.end_date.startsWith(filters.month));
    
    return matchesTruck && matchesStartDate && matchesEndDate && matchesMonth;
  });

  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedTrucks(filteredTrucks.map(truck => truck.id));
    } else {
      setSelectedTrucks([]);
    }
  };

  const handleSelectTruck = (truckId) => {
    setSelectedTrucks(prev =>
      prev.includes(truckId) ? prev.filter(id => id !== truckId) : [...prev, truckId]
    );
  };

  const handlePrint = () => {
    const trucksToPrint = selectedTrucks.length > 0
      ? filteredTrucks.filter(truck => selectedTrucks.includes(truck.id))
      : filteredTrucks;
    const printContent = `
      <html><head><title>Print Market Trucks</title>
      <style>
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        .header { text-align: center; margin-bottom: 20px; }
        .filters { margin-bottom: 20px; font-size: 14px; }
        @media print { body { margin: 0; } }
      </style>
      </head><body>
      <div class="header">
        <h2>Market Trucks Report</h2>
        <div class="filters">
          ${filters.truckNumber ? `<strong>Truck:</strong> ${filters.truckNumber} | ` : ''}
          ${filters.month ? `<strong>Month:</strong> ${filters.month} | ` : ''}
          ${filters.startDate ? `<strong>Start Date:</strong> ${filters.startDate} | ` : ''}
          ${filters.endDate ? `<strong>End Date:</strong> ${filters.endDate}` : ''}
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Sr. No</th>
            <th>Truck Number</th>
            <th>Model</th>
            <th>Capacity</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Rate</th>
          </tr>
        </thead>
        <tbody>
          ${trucksToPrint.map((truck, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${truck.truck_number}</td>
              <td>${truck.model}</td>
              <td>${truck.capacity} Ton</td>
              <td>${new Date(truck.start_date).toLocaleDateString('en-GB')}</td>
              <td>${new Date(truck.end_date).toLocaleDateString('en-GB')}</td>
              <td>${truck.status}</td>
              <td>${Number(truck.rate).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="margin-top: 20px; font-weight: bold;">
        Total Records: ${trucksToPrint.length}
      </div>
      </body></html>
    `;
    
    const printWindow = window.open('', '', 'height=600,width=900');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Market Trucks</Typography>
        <Tooltip title="Print Filtered Results">
          <IconButton onClick={handlePrint} color="primary">
            <PrintIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Filters Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Truck Number</InputLabel>
            <Select
              value={filters.truckNumber}
              onChange={handleFilterChange('truckNumber')}
              label="Truck Number"
            >
              <MenuItem value="">All Trucks</MenuItem>
              {[...new Set(trucks.map(truck => truck.truck_number))]
                .filter(number => number)
                .map((number, index) => (
                  <MenuItem key={`truck-${index}`} value={number}>
                    {number}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            type="month"
            label="Month"
            value={filters.month}
            onChange={handleFilterChange('month')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={filters.startDate}
            onChange={handleFilterChange('startDate')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            type="date"
            label="End Date"
            value={filters.endDate}
            onChange={handleFilterChange('endDate')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            onClick={() => setFilters({
              truckNumber: '',
              startDate: '',
              endDate: '',
              month: new Date().toISOString().slice(0, 7)
            })}
            fullWidth
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedTrucks.length > 0 && selectedTrucks.length < filteredTrucks.length}
                    checked={filteredTrucks.length > 0 && selectedTrucks.length === filteredTrucks.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Sr. No.</TableCell>
                <TableCell>Truck Number</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTrucks.map((truck, index) => (
                <TableRow key={truck.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedTrucks.includes(truck.id)}
                      onChange={() => handleSelectTruck(truck.id)}
                    />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{truck.truck_number}</TableCell>
                  <TableCell>{truck.model}</TableCell>
                  <TableCell>{truck.capacity} Ton</TableCell>
                  <TableCell>{new Date(truck.start_date).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>{new Date(truck.end_date).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>{truck.status}</TableCell>
                  <TableCell>{Number(truck.rate).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default MarketTrucks; 