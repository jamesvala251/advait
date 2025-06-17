import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert
} from "@mui/material";
import { tripProfitLossService, driverService, truckService } from "../services/api";

export default function ProfitLoss() {
  const [reports, setReports] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [totals, setTotals] = useState({
    total_km: 0,
    total_expenses: 0,
    total_profit: 0,
    total_per_day_profit: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    driver: '',
    startDate: '',
    endDate: '',
    month: new Date().toISOString().slice(0, 7)
  });

  // Fetch all drivers and trucks for filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching drivers and trucks data...');
        const [driversResponse, trucksResponse] = await Promise.all([
          driverService.getAll(),
          truckService.getAll()
        ]);
        console.log('Drivers response:', driversResponse.data);
        console.log('Trucks response:', trucksResponse.data);
        
        // Handle drivers data - it's directly in the response array
        if (Array.isArray(driversResponse.data)) {
          // Remove duplicates and sort by name
          const uniqueDrivers = Array.from(
            new Map(driversResponse.data.map(driver => [driver.name, driver])).values()
          ).sort((a, b) => a.name.localeCompare(b.name));
          
          console.log('Unique drivers:', uniqueDrivers);
          setDrivers(uniqueDrivers);
        } else if (driversResponse.data?.data) {
          // Remove duplicates and sort by name
          const uniqueDrivers = Array.from(
            new Map(driversResponse.data.data.map(driver => [driver.name, driver])).values()
          ).sort((a, b) => a.name.localeCompare(b.name));
          
          console.log('Unique drivers:', uniqueDrivers);
          setDrivers(uniqueDrivers);
        } else {
          console.error('Unexpected drivers data structure:', driversResponse.data);
          setDrivers([]);
        }
        
        // Handle trucks data - it's nested under data property
        if (trucksResponse.data?.data) {
          setTrucks(trucksResponse.data.data);
        } else {
          console.error('Unexpected trucks data structure:', trucksResponse.data);
          setTrucks([]);
        }
      } catch (err) {
        console.error('Error fetching filter data:', err);
        setError('Failed to fetch drivers and trucks data. Please try again.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching reports with filters:', filters);
      const response = await tripProfitLossService.getAll({
        start_date: filters.startDate,
        end_date: filters.endDate,
        driver_id: filters.driver,
        truck_id: filters.truck_id
      });
      console.log('Reports response:', response.data);
      setReports(response.data.reports || []);
      setTotals(response.data.totals || {
        total_km: 0,
        total_expenses: 0,
        total_profit: 0,
        total_per_day_profit: 0
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch profit/loss reports. Please try again.');
      console.error('Error fetching profit/loss reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field) => (event) => {
    const value = event.target.value;
    console.log('Filter change:', { field, value });
    setFilters(prev => ({
      ...prev,
      [field]: value || ""
    }));
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Profit/Loss Reports</Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Driver</InputLabel>
              <Select
                value={filters.driver}
                onChange={handleFilterChange('driver')}
                label="Driver"
              >
                <MenuItem value="">All Drivers</MenuItem>
                {drivers && drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No drivers available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Truck</InputLabel>
              <Select
                value={filters.truck_id || ""}
                onChange={handleFilterChange('truck_id')}
                label="Truck"
              >
                <MenuItem value="">All Trucks</MenuItem>
                {trucks.map((truck) => (
                  <MenuItem key={`truck-${truck.id}`} value={truck.id}>
                    {truck.truck_number} - {truck.model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={filters.startDate || ""}
              onChange={handleFilterChange('startDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={filters.endDate || ""}
              onChange={handleFilterChange('endDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

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
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Trip Number</TableCell>
                <TableCell>Driver Name</TableCell>
                <TableCell>Truck</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Route</TableCell>
                <TableCell align="right">Total KM</TableCell>
                <TableCell align="right">Total Expenses</TableCell>
                <TableCell align="right">Total Profit</TableCell>
                <TableCell align="right">Per Day Profit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report, index) => (
                <TableRow key={index}>
                  <TableCell>{report.trip_number}</TableCell>
                  <TableCell>{report.driver_name}</TableCell>
                  <TableCell>{report.truck}</TableCell>
                  <TableCell>{report.dates}</TableCell>
                  <TableCell>{report.route}</TableCell>
                  <TableCell align="right">{Number(report.total_km).toFixed(2)}</TableCell>
                  <TableCell align="right">{Number(report.total_expenses).toFixed(2)}</TableCell>
                  <TableCell align="right">{Number(report.total_profit).toFixed(2)}</TableCell>
                  <TableCell align="right">{Number(report.per_day_profit).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} align="right"><strong>Totals:</strong></TableCell>
                <TableCell align="right"><strong>{Number(totals.total_km).toFixed(2)}</strong></TableCell>
                <TableCell align="right"><strong>{Number(totals.total_expenses).toFixed(2)}</strong></TableCell>
                <TableCell align="right"><strong>{Number(totals.total_profit).toFixed(2)}</strong></TableCell>
                <TableCell align="right"><strong>{Number(totals.total_per_day_profit).toFixed(2)}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </>
      )}
    </Paper>
  );
} 