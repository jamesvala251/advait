import React, { useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  Checkbox
} from "@mui/material";
import PrintIcon from '@mui/icons-material/Print';
import * as XLSX from "xlsx";

export default function DriverReports({ trips }) {
  const [selectedDriver, setSelectedDriver] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDrivers, setSelectedDrivers] = useState([]);

  // Get unique driver names
  const driverNames = Array.from(new Set(trips.map(t => t.driverName).filter(Boolean)));

  // Filter trips based on selected driver and date range
  const filteredTrips = trips.filter(trip => {
    const matchesDriver = !selectedDriver || trip.driverName === selectedDriver;
    const matchesStartDate = !startDate || trip.startDate >= startDate;
    const matchesEndDate = !endDate || trip.endDate <= endDate;
    return matchesDriver && matchesStartDate && matchesEndDate;
  });

  // Group trips by driver
  const driverTrips = filteredTrips.reduce((acc, trip) => {
    if (!acc[trip.driverName]) {
      acc[trip.driverName] = [];
    }
    acc[trip.driverName].push(trip);
    return acc;
  }, {});

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedDrivers(Object.keys(driverTrips));
    } else {
      setSelectedDrivers([]);
    }
  };

  const handleSelectDriver = (driverName) => {
    setSelectedDrivers(prev => {
      if (prev.includes(driverName)) {
        return prev.filter(name => name !== driverName);
      } else {
        return [...prev, driverName];
      }
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const driversToPrint = Object.entries(driverTrips)
      .filter(([driverName]) => selectedDrivers.includes(driverName))
      .map(([driverName, trips]) => {
        const totalSalary = trips.reduce((sum, t) => sum + Number(t.driverSalary || 0), 0);
        const totalAdvance = trips.reduce((sum, t) => sum + Number(t.advancedSalary || 0), 0);
        const balancedSalary = totalSalary - totalAdvance;

        return {
          driverName,
          trips: trips.map(t => ({
            startDate: t.startDate,
            endDate: t.endDate,
            from: t.from,
            to: t.to,
            driverSalary: t.driverSalary,
            advancedSalary: t.advancedSalary
          })),
          totalSalary,
          totalAdvance,
          balancedSalary
        };
      });

    const printContent = `
      <html>
        <head>
          <title>Driver Salary Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .driver-summary { margin-bottom: 30px; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .header { text-align: center; margin-bottom: 20px; }
            @media print {
              .no-print { display: none; }
              table { font-size: 12px; }
              th, td { padding: 4px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Advait Road Movers</h1>
            <h2>Driver Salary Report</h2>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="no-print">
            <button onclick="window.print()">Print Report</button>
          </div>
          ${driversToPrint.map(driver => `
            <div class="driver-summary">
              <h2>Driver: ${driver.driverName}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Trip Start Date</th>
                    <th>Trip End Date</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Driver Salary</th>
                    <th>Advanced Salary</th>
                  </tr>
                </thead>
                <tbody>
                  ${driver.trips.map(trip => `
                    <tr>
                      <td>${trip.startDate}</td>
                      <td>${trip.endDate}</td>
                      <td>${trip.from}</td>
                      <td>${trip.to}</td>
                      <td>₹${Number(trip.driverSalary).toFixed(2)}</td>
                      <td>₹${Number(trip.advancedSalary).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="4">Total</td>
                    <td>₹${driver.totalSalary.toFixed(2)}</td>
                    <td>₹${driver.totalAdvance.toFixed(2)}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="4">Balanced Salary</td>
                    <td colspan="2">₹${driver.balancedSalary.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const exportToExcel = () => {
    const exportData = Object.entries(driverTrips)
      .filter(([driverName]) => selectedDrivers.includes(driverName))
      .flatMap(([driverName, trips]) => {
        const totalSalary = trips.reduce((sum, t) => sum + Number(t.driverSalary || 0), 0);
        const totalAdvance = trips.reduce((sum, t) => sum + Number(t.advancedSalary || 0), 0);
        const balancedSalary = totalSalary - totalAdvance;

        return trips.map(trip => ({
          "Driver Name": driverName,
          "Trip Start Date": trip.startDate,
          "Trip End Date": trip.endDate,
          "From": trip.from,
          "To": trip.to,
          "Driver Salary": trip.driverSalary,
          "Advanced Salary": trip.advancedSalary,
          "Total Salary": totalSalary,
          "Total Advance": totalAdvance,
          "Balanced Salary": balancedSalary
        }));
      });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Driver Reports");
    XLSX.writeFile(workbook, "driver_reports.xlsx");
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>Driver Reports</Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Driver</InputLabel>
              <Select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                label="Driver"
              >
                <MenuItem value="">All Drivers</MenuItem>
                {driverNames.map((name) => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={selectedDrivers.length === 0}
        >
          Print Selected
        </Button>
        <Button
          variant="outlined"
          onClick={exportToExcel}
          disabled={selectedDrivers.length === 0}
        >
          Export Selected to Excel
        </Button>
      </Box>

      {/* Driver Reports Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedDrivers.length === Object.keys(driverTrips).length}
                  indeterminate={selectedDrivers.length > 0 && selectedDrivers.length < Object.keys(driverTrips).length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Driver Name</TableCell>
              <TableCell>Trip Start Date</TableCell>
              <TableCell>Trip End Date</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell align="right">Driver Salary</TableCell>
              <TableCell align="right">Advanced Salary</TableCell>
              <TableCell align="right">Balanced Salary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(driverTrips).map(([driverName, trips]) => {
              const totalSalary = trips.reduce((sum, t) => sum + Number(t.driverSalary || 0), 0);
              const totalAdvance = trips.reduce((sum, t) => sum + Number(t.advancedSalary || 0), 0);
              const balancedSalary = totalSalary - totalAdvance;

              return (
                <React.Fragment key={driverName}>
                  {trips.map((trip, index) => (
                    <TableRow key={`${driverName}-${index}`}>
                      <TableCell padding="checkbox">
                        {index === 0 && (
                          <Checkbox
                            checked={selectedDrivers.includes(driverName)}
                            onChange={() => handleSelectDriver(driverName)}
                          />
                        )}
                      </TableCell>
                      <TableCell>{index === 0 ? driverName : ''}</TableCell>
                      <TableCell>{trip.startDate}</TableCell>
                      <TableCell>{trip.endDate}</TableCell>
                      <TableCell>{trip.from}</TableCell>
                      <TableCell>{trip.to}</TableCell>
                      <TableCell align="right">₹{Number(trip.driverSalary).toFixed(2)}</TableCell>
                      <TableCell align="right">₹{Number(trip.advancedSalary).toFixed(2)}</TableCell>
                      <TableCell align="right">₹{balancedSalary.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell colSpan={5}><strong>Total for {driverName}</strong></TableCell>
                    <TableCell align="right"><strong>₹{totalSalary.toFixed(2)}</strong></TableCell>
                    <TableCell align="right"><strong>₹{totalAdvance.toFixed(2)}</strong></TableCell>
                    <TableCell align="right"><strong>₹{balancedSalary.toFixed(2)}</strong></TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
} 