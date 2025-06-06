import React, { useState, useEffect, useRef } from "react";
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
  Alert,
  Checkbox,
  Button
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
  const [selected, setSelected] = useState([]);
  const printRef = useRef();

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

  // Add event listener for trip updates
  useEffect(() => {
    const handleTripUpdate = (event) => {
      // If we have a driver filter and it matches the updated trip's driver, refresh the reports
      if (!filters.driver_id || filters.driver_id === event.detail.driverId) {
        fetchReports();
      }
    };

    window.addEventListener('tripUpdated', handleTripUpdate);
    return () => {
      window.removeEventListener('tripUpdated', handleTripUpdate);
    };
  }, [filters.driver_id]);

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
      setSelected([]); // clear selection on new data
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

  // Selection logic
  const isSelected = (idx) => selected.indexOf(idx) !== -1;
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(reports.map((_, idx) => idx));
    } else {
      setSelected([]);
    }
  };
  const handleClick = (idx) => {
    const selectedIndex = selected.indexOf(idx);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, idx);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  // Print selected
  const handlePrintSelected = () => {
    const selectedReports = reports.filter((_, idx) => selected.includes(idx));
    const printContent = `
      <html><head><title>Print Driver Reports</title>
      <style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ccc; padding: 8px; } th { background: #f5f5f5; }</style>
      </head><body>
      <h2>Driver Reports</h2>
      <table>
        <thead>
          <tr>
            <th>Driver Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>From</th>
            <th>To</th>
            <th style='text-align:right;'>Driver Salary</th>
            <th style='text-align:right;'>Advanced Salary</th>
            <th style='text-align:right;'>Balanced Salary</th>
          </tr>
        </thead>
        <tbody>
          ${selectedReports.map(report => `
            <tr>
              <td>${report.driver_name}</td>
              <td>${new Date(report.start_date).toLocaleDateString('en-GB')}</td>
              <td>${new Date(report.end_date).toLocaleDateString('en-GB')}</td>
              <td>${report.origin}</td>
              <td>${report.destination}</td>
              <td style='text-align:right;'>₹${Number(report.driver_salary).toFixed(2)}</td>
              <td style='text-align:right;'>₹${Number(report.advanced_salary).toFixed(2)}</td>
              <td style='text-align:right;'>₹${Number(report.balanced_salary).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </body></html>
    `;
    const printWindow = window.open('', '', 'height=600,width=900');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
              {Array.from(
                drivers.reduce((map, driver) => {
                  const key = driver.id;
                  if (!map.has(key)) map.set(key, driver);
                  return map;
                }, new Map()).values()
              ).map((driver) => (
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

      {/* Print Selected Button */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={selected.length === 0}
          onClick={handlePrintSelected}
        >
          Print Selected
        </Button>
      </Box>

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
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < reports.length}
                    checked={reports.length > 0 && selected.length === reports.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
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
              {reports.map((report, index) => {
                const isItemSelected = isSelected(index);
                return (
                  <TableRow key={index} selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleClick(index)}
                      />
                    </TableCell>
                    <TableCell>{report.driver_name}</TableCell>
                    <TableCell>{new Date(report.start_date).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell>{new Date(report.end_date).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell>{report.origin}</TableCell>
                    <TableCell>{report.destination}</TableCell>
                    <TableCell align="right">₹{Number(report.driver_salary).toFixed(2)}</TableCell>
                    <TableCell align="right">₹{Number(report.advanced_salary).toFixed(2)}</TableCell>
                    <TableCell align="right">₹{Number(report.balanced_salary).toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell colSpan={6} align="right"><strong>Totals:</strong></TableCell>
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