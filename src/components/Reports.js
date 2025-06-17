import React, { useState } from "react";
import { TextField, Select, MenuItem, Button, Autocomplete, Grid, FormControl, InputLabel, Paper, Typography, Box } from "@mui/material";
import * as XLSX from "xlsx";

const gujaratCities = [
  "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar",
  "Junagadh", "Anand", "Nadiad", "Navsari", "Morbi", "Bharuch", "Mehsana", "Tulsigam"
  // ...add more as needed
];

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function Reports({ trips, clearTrips }) {
  // Get unique values for filters
  const truckNumbers = Array.from(new Set(trips.map(t => t.truckNumber)));
  const driverNames = Array.from(new Set(trips.map(t => t.driverName).filter(Boolean)));
  const years = Array.from(new Set(trips.map(t => t.startDate && t.startDate.slice(0, 4)))).filter(Boolean);

  const [filter, setFilter] = useState({
    truck: "",
    driver: "",
    from: "",
    to: "",
    start: "",
    end: "",
    salaryTruck: "",
    salaryDriver: "",
    salaryMonth: "",
    salaryYear: ""
  });

  const handleChange = (e) => setFilter({ ...filter, [e.target.name]: e.target.value });

  // Filtered trips for summary
  const filtered = trips.filter((t) => {
    return (
      (!filter.truck || t.truckNumber === filter.truck) &&
      (!filter.driver || t.driverName === filter.driver) &&
      (!filter.from || (t.from && t.from.toLowerCase().includes(filter.from.toLowerCase()))) &&
      (!filter.to || (t.to && t.to.toLowerCase().includes(filter.to.toLowerCase()))) &&
      (!filter.start || t.startDate >= filter.start) &&
      (!filter.end || t.endDate <= filter.end)
    );
  });

  // Summary calculations
  const totalProfit = filtered.reduce((sum, t) => sum + (t.totalProfit || 0), 0);
  const totalExpenses = filtered.reduce((sum, t) => sum + (t.totalExpenses || 0), 0);
  const totalDiesel = filtered.reduce((sum, t) => sum + Number(t.dieselQty || 0), 0);
  const totalFreight = filtered.reduce((sum, t) => sum + Number(t.totalFreight || 0), 0);

  // Driver Salary Calculation
  const salaryTrips = trips.filter(t => {
    const matchesTruck = !filter.salaryTruck || t.truckNumber === filter.salaryTruck;
    const matchesDriver = !filter.salaryDriver || t.driverName === filter.salaryDriver;
    const matchesYear = !filter.salaryYear || (t.startDate && t.startDate.slice(0, 4) === filter.salaryYear);
    const matchesMonth = !filter.salaryMonth || (t.startDate && t.startDate.slice(5, 7) === filter.salaryMonth);
    return matchesTruck && matchesDriver && matchesYear && matchesMonth;
  });

  const totalDriverSalary = salaryTrips.reduce((sum, t) => sum + Number(t.driverSalary || 0), 0);
  const totalAdvancedSalary = salaryTrips.reduce((sum, t) => sum + Number(t.advancedSalary || 0), 0);
  const totalSalary = totalDriverSalary - totalAdvancedSalary;

  // Export to Excel
  const exportToExcel = () => {
    const exportData = [
      {
        "Total Profit": totalProfit,
        "Total Expenses": totalExpenses,
        "Total Diesel Used": totalDiesel,
        "Total Freight Earned": totalFreight,
        "Total Driver Salary": totalDriverSalary,
        "Total Advanced Salary": totalAdvancedSalary,
        "Balanced Salary (Driver - Advanced)": totalSalary
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
    XLSX.writeFile(workbook, "report_summary.xlsx");
  };

  return (
    <div>
      <h2>Reports (Summary)</h2>
      
      {/* General Summary Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>General Summary</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Truck</InputLabel>
              <Select
                name="truck"
                value={filter.truck}
                onChange={handleChange}
                label="Truck"
              >
                <MenuItem value="">All Trucks</MenuItem>
                {truckNumbers.map((num) => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Driver</InputLabel>
              <Select
                name="driver"
                value={filter.driver}
                onChange={handleChange}
                label="Driver"
              >
                <MenuItem value="">All Drivers</MenuItem>
                {driverNames.map((name) => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              freeSolo
              options={gujaratCities}
              value={filter.from}
              onInputChange={(event, newValue) => setFilter(f => ({ ...f, from: newValue }))}
              renderInput={(params) => <TextField {...params} label="From" name="from" fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              freeSolo
              options={gujaratCities}
              value={filter.to}
              onInputChange={(event, newValue) => setFilter(f => ({ ...f, to: newValue }))}
              renderInput={(params) => <TextField {...params} label="To" name="to" fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              label="Start Date" 
              name="start" 
              type="date" 
              value={filter.start} 
              onChange={handleChange} 
              InputLabelProps={{ shrink: true }}
              fullWidth 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              label="End Date" 
              name="end" 
              type="date" 
              value={filter.end} 
              onChange={handleChange} 
              InputLabelProps={{ shrink: true }}
              fullWidth 
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Summary Results:</Typography>
          <Typography><b>Total Profit:</b> {totalProfit.toFixed(2)}</Typography>
          <Typography><b>Total Expenses:</b> {totalExpenses.toFixed(2)}</Typography>
          <Typography><b>Total Diesel Used:</b> {totalDiesel} L</Typography>
          <Typography><b>Total Freight Earned:</b> {totalFreight.toFixed(2)}</Typography>
        </Box>
      </Paper>

      {/* Salary Summary Section */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Salary Summary</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Truck</InputLabel>
              <Select
                name="salaryTruck"
                value={filter.salaryTruck}
                onChange={handleChange}
                label="Truck"
              >
                <MenuItem value="">All Trucks</MenuItem>
                {truckNumbers.map((num) => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Driver</InputLabel>
              <Select
                name="salaryDriver"
                value={filter.salaryDriver}
                onChange={handleChange}
                label="Driver"
              >
                <MenuItem value="">All Drivers</MenuItem>
                {driverNames.map((name) => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                name="salaryMonth"
                value={filter.salaryMonth}
                onChange={handleChange}
                label="Month"
              >
                <MenuItem value="">All Months</MenuItem>
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                name="salaryYear"
                value={filter.salaryYear}
                onChange={handleChange}
                label="Year"
              >
                <MenuItem value="">All Years</MenuItem>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Salary Results:</Typography>
          <Typography><b>Total Driver Salary:</b> {totalDriverSalary.toFixed(2)}</Typography>
          <Typography><b>Total Advanced Salary:</b> {totalAdvancedSalary.toFixed(2)}</Typography>
          <Typography><b>Balanced Salary (Driver - Advanced):</b> {totalSalary.toFixed(2)}</Typography>
        </Box>
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={exportToExcel}>
          Export to Excel
        </Button>
        {trips.length > 0 && (
          <Button variant="outlined" color="error" onClick={clearTrips}>
            Clear All Data
          </Button>
        )}
      </Box>
    </div>
  );
} 