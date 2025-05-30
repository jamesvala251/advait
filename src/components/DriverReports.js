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
import { driverReportService, driverService } from "../services/api";

export default function DriverReports() {
  const [reports, setReports] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [totals, setTotals] = useState({
    total_salary: 0,
    total_advanced: 0,
    total_balanced: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    driver_id: "",
    start_date: "",
    end_date: ""
  });

  // Fetch all drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await driverService.getAll();
        setDrivers(response.data || []);
      } catch (err) {
        console.error('Error fetching drivers:', err);
      }
    };
    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await driverReportService.getAll(filters);
      setReports(response.data.reports || []);
      setTotals(response.data.totals || {
        total_salary: 0,
        total_advanced: 0,
        total_balanced: 0
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch driver reports. Please try again.');
      console.error('Error fetching driver reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field) => (event) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      [field]: value || "" // Ensure empty string instead of undefined
    }));
  };

  // Format date for API
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Driver Reports</Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Driver</InputLabel>
            <Select
              value={filters.driver_id || ""}
              onChange={handleFilterChange('driver_id')}
              label="Driver"
            >
              <MenuItem value="" key="all-drivers">All Drivers</MenuItem>
              {[
                ...new Map(
                  drivers.map(driver => [driver.id, driver])
                ).values()
              ].map((driver) => (
                <MenuItem key={`driver-${driver.id}`} value={driver.id}>
                  {driver.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={filters.start_date || ""}
            onChange={handleFilterChange('start_date')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="date"
            label="End Date"
            value={filters.end_date || ""}
            onChange={handleFilterChange('end_date')}
            InputLabelProps={{ shrink: true }}
          />
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
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver Name</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell align="right">Driver Salary</TableCell>
                <TableCell align="right">Advanced Salary</TableCell>
                <TableCell align="right">Balanced Salary</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report, index) => (
                <TableRow key={index}>
                  <TableCell>{report.driver_name}</TableCell>
                  <TableCell>{new Date(report.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(report.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{report.origin}</TableCell>
                  <TableCell>{report.destination}</TableCell>
                  <TableCell align="right">₹{Number(report.driver_salary).toFixed(2)}</TableCell>
                  <TableCell align="right">₹{Number(report.advanced_salary).toFixed(2)}</TableCell>
                  <TableCell align="right">₹{Number(report.balanced_salary).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} align="right"><strong>Totals:</strong></TableCell>
                <TableCell align="right"><strong>₹{Number(totals.total_salary).toFixed(2)}</strong></TableCell>
                <TableCell align="right"><strong>₹{Number(totals.total_advanced).toFixed(2)}</strong></TableCell>
                <TableCell align="right"><strong>₹{Number(totals.total_balanced).toFixed(2)}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </>
      )}
    </Paper>
  );
} 