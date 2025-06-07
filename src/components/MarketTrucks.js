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
  Alert
} from '@mui/material';
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

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Market Trucks</Typography>
      
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
              {filteredTrucks.map((truck) => (
                <TableRow key={truck.id}>
                  <TableCell>{truck.truck_number}</TableCell>
                  <TableCell>{truck.model}</TableCell>
                  <TableCell>{truck.capacity} Ton</TableCell>
                  <TableCell>{new Date(truck.start_date).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>{new Date(truck.end_date).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>{truck.status}</TableCell>
                  <TableCell>₹{Number(truck.rate).toFixed(2)}</TableCell>
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