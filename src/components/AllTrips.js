import React, { useState } from "react";
import { 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Paper, 
  Button, 
  IconButton, 
  Tooltip, 
  Checkbox,
  TextField,
  Select,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Typography,
  Box
} from "@mui/material";
import * as XLSX from "xlsx";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';

export default function AllTrips({ trips }) {
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [filters, setFilters] = useState({
    truckNumber: '',
    startDate: '',
    endDate: ''
  });

  const columns = [
    "Trip Number", "Truck", "Driver Name", "Start Date", "End Date", "From", "To", "Party Name", "Compressor", "Start KM", "End KM", "Total KM", "Diesel Qty", "Diesel Amount", "Toll", "Driver Salary", "Advanced Salary", "Maintenance", "Freight", "Weight", "Total Freight", "Total Expenses", "Total Profit", "Per Day Profit"
  ];

  // Get unique truck numbers for the filter dropdown
  const uniqueTruckNumbers = [...new Set(trips.map(trip => trip.truckNumber))];

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Filter trips based on selected criteria
  const filteredTrips = trips.filter(trip => {
    const matchesTruck = !filters.truckNumber || trip.truckNumber === filters.truckNumber;
    const matchesStartDate = !filters.startDate || trip.startDate >= filters.startDate;
    const matchesEndDate = !filters.endDate || trip.endDate <= filters.endDate;
    return matchesTruck && matchesStartDate && matchesEndDate;
  });

  const exportToExcel = (data, filename = "all_trips.xlsx") => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AllTrips");
    XLSX.writeFile(workbook, filename);
  };

  const mapTripToExport = (t) => ({
    "Trip Number": t.tripNumber,
    "Truck": t.truckNumber,
    "Driver Name": t.driverName,
    "Start Date": t.startDate,
    "End Date": t.endDate,
    "From": t.from,
    "To": t.to,
    "Party Name": t.partyName,
    "Compressor": t.compressor,
    "Start KM": t.startKm,
    "End KM": t.endKm,
    "Total KM": t.totalKm,
    "Diesel Qty": t.dieselQty,
    "Diesel Amount": t.dieselAmount,
    "Toll": t.toll,
    "Driver Salary": t.driverSalary,
    "Advanced Salary": t.advancedSalary,
    "Maintenance": t.maintenance,
    "Freight": t.freight,
    "Weight": t.weight,
    "Total Freight": t.totalFreight,
    "Total Expenses": t.totalExpenses,
    "Total Profit": t.totalProfit,
    "Per Day Profit": t.perDayProfit !== undefined ? Number(t.perDayProfit).toFixed(2) : ""
  });

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedTrips(filteredTrips.map(trip => trip.id));
    } else {
      setSelectedTrips([]);
    }
  };

  const handleSelectTrip = (tripId) => {
    setSelectedTrips(prev => {
      if (prev.includes(tripId)) {
        return prev.filter(id => id !== tripId);
      } else {
        return [...prev, tripId];
      }
    });
  };

  const handleExportSelected = () => {
    const selectedTripData = filteredTrips
      .filter(trip => selectedTrips.includes(trip.id))
      .map(mapTripToExport);
    exportToExcel(selectedTripData, "selected_trips.xlsx");
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const tripsToPrint = filteredTrips.filter(trip => selectedTrips.includes(trip.id));

    const printContent = `
      <html>
        <head>
          <title>Trip Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .header { text-align: center; margin-bottom: 20px; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
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
            <h2>Trip Report</h2>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="no-print">
            <button onclick="window.print()">Print Report</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Trip Number</th>
                <th>Truck</th>
                <th>Driver Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>From</th>
                <th>To</th>
                <th>Party Name</th>
                <th>Compressor</th>
                <th>Start KM</th>
                <th>End KM</th>
                <th>Total KM</th>
                <th>Diesel Qty</th>
                <th>Diesel Amount</th>
                <th>Toll</th>
                <th>Driver Salary</th>
                <th>Advanced Salary</th>
                <th>Maintenance</th>
                <th>Freight</th>
                <th>Weight</th>
                <th>Total Freight</th>
                <th>Total Expenses</th>
                <th>Total Profit</th>
                <th>Per Day Profit</th>
              </tr>
            </thead>
            <tbody>
              ${tripsToPrint.map(trip => `
                <tr>
                  <td>${trip.tripNumber || ''}</td>
                  <td>${trip.truckNumber || ''}</td>
                  <td>${trip.driverName || ''}</td>
                  <td>${trip.startDate || ''}</td>
                  <td>${trip.endDate || ''}</td>
                  <td>${trip.from || ''}</td>
                  <td>${trip.to || ''}</td>
                  <td>${trip.partyName || ''}</td>
                  <td>${trip.compressor || ''}</td>
                  <td>${trip.startKm || ''}</td>
                  <td>${trip.endKm || ''}</td>
                  <td>${trip.totalKm || ''}</td>
                  <td>${trip.dieselQty || ''}</td>
                  <td>₹${Number(trip.dieselAmount || 0).toFixed(2)}</td>
                  <td>₹${Number(trip.toll || 0).toFixed(2)}</td>
                  <td>₹${Number(trip.driverSalary || 0).toFixed(2)}</td>
                  <td>₹${Number(trip.advancedSalary || 0).toFixed(2)}</td>
                  <td>₹${Number(trip.maintenance || 0).toFixed(2)}</td>
                  <td>₹${Number(trip.freight || 0).toFixed(2)}</td>
                  <td>${trip.weight || ''}</td>
                  <td>₹${Number(trip.totalFreight || 0).toFixed(2)}</td>
                  <td>₹${Number(trip.totalExpenses || 0).toFixed(2)}</td>
                  <td>₹${Number(trip.totalProfit || 0).toFixed(2)}</td>
                  <td>₹${Number(trip.perDayProfit || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="14">Total</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.toll || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.driverSalary || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.advancedSalary || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.maintenance || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.freight || 0), 0).toFixed(2)}</td>
                <td></td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.totalFreight || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.totalExpenses || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.totalProfit || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.perDayProfit || 0), 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>All Trips</Typography>
      
      {/* Filters Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Truck Number</InputLabel>
            <Select
              value={filters.truckNumber}
              onChange={handleFilterChange('truckNumber')}
              label="Truck Number"
            >
              <MenuItem value="">All Trucks</MenuItem>
              {uniqueTruckNumbers.map(truckNumber => (
                <MenuItem key={truckNumber} value={truckNumber}>
                  {truckNumber}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange('startDate')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange('endDate')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Button 
          variant="outlined" 
          onClick={() => exportToExcel(filteredTrips.map(mapTripToExport))} 
          disabled={filteredTrips.length === 0}
        >
          Export All to Excel
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleExportSelected} 
          disabled={selectedTrips.length === 0}
        >
          Export Selected to Excel
        </Button>
      </div>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={selectedTrips.length === 0}
        >
          Print Selected
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedTrips.length > 0 && selectedTrips.length < filteredTrips.length}
                checked={filteredTrips.length > 0 && selectedTrips.length === filteredTrips.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            {columns.map(col => <TableCell key={col}>{col}</TableCell>)}
            <TableCell>Export</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredTrips.map((t) => {
            const exportObj = mapTripToExport(t);
            return (
              <TableRow key={t.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedTrips.includes(t.id)}
                    onChange={() => handleSelectTrip(t.id)}
                  />
                </TableCell>
                {columns.map(col => <TableCell key={col}>{exportObj[col]}</TableCell>)}
                <TableCell>
                  <Tooltip title="Export Excel">
                    <IconButton size="small" onClick={() => exportToExcel([exportObj], `trip_${t.tripNumber}.xlsx`)}>
                      <FileDownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
} 