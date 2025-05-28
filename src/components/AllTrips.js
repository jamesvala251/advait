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

export default function AllTrips({ trips, trucks }) {
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [filters, setFilters] = useState({
    truckNumber: '',
    startDate: '',
    endDate: '',
    loadCapacity: ''
  });

  const columns = [
    "Trip Number", "Truck", "Driver Name", "Start Date", "End Date", "From", "To", "Party Name", "Compressor", "Start KM", "End KM", "Total KM", "Diesel Qty", "Diesel Amount", "Toll", "Driver Salary", "Advanced Salary", "Maintenance", "Freight", "Weight", "Total Freight", "Total Expenses", "Total Profit", "Per Day Profit"
  ];

  const mapTripToExport = (t) => {
    // Get diesel quantity from fuel_consumed field
    const dieselQty = t.fuel_consumed || 0;
    
    return {
      "Trip Number": t.trip_number || t.tripNumber,
      "Truck": t.truck ? `${t.truck.truck_number} (${t.truck.model})` : '',
      "Driver Name": t.driver ? t.driver.name : '',
      "Start Date": t.start_date || t.startDate,
      "End Date": t.end_date || t.endDate,
      "From": t.origin || t.from_city || t.fromCity || t.from || '',
      "To": t.destination || t.to_city || t.toCity || t.to || '',
      "Party Name": t.party_name || t.partyName || '',
      "Compressor": t.compressor || '',
      "Start KM": t.start_km || t.startKm || 0,
      "End KM": t.end_km || t.endKm || 0,
      "Total KM": t.total_km || t.totalKm || 0,
      "Diesel Qty": dieselQty,
      "Diesel Amount": t.diesel_amount || t.dieselAmount || 0,
      "Toll": t.toll || 0,
      "Driver Salary": t.driver_salary || t.driverSalary || 0,
      "Advanced Salary": t.advanced_salary || t.advancedSalary || 0,
      "Maintenance": t.maintenance || 0,
      "Freight": t.freight || 0,
      "Weight": t.weight || 0,
      "Total Freight": t.total_freight || t.totalFreight || 0,
      "Total Expenses": t.total_expenses || t.totalExpenses || 0,
      "Total Profit": t.total_profit || t.totalProfit || 0,
      "Per Day Profit": t.per_day_profit || t.perDayProfit || 0
    };
  };

  // Filter trips based on selected criteria
  const filteredTrips = trips.filter(trip => {
    const tripTruckNumber = trip.truck ? trip.truck.truck_number : '';
    const tripStartDate = trip.start_date || trip.startDate;
    const tripEndDate = trip.end_date || trip.endDate;
    const tripFrom = trip.origin || trip.from_city || trip.fromCity || trip.from || '';
    const tripTo = trip.destination || trip.to_city || trip.toCity || trip.to || '';
    
    // Extract just the truck number from the display string (e.g., "1234 (Model - 10 Ton)" -> "1234")
    const selectedTruckNumber = filters.truckNumber ? filters.truckNumber.split(' ')[0] : '';
    
    const matchesTruck = !filters.truckNumber || tripTruckNumber === selectedTruckNumber;
    const matchesStartDate = !filters.startDate || new Date(tripStartDate) >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || new Date(tripEndDate) <= new Date(filters.endDate);
    const matchesLoadCapacity = !filters.loadCapacity || 
      (trip.truck && trip.truck.capacity === filters.loadCapacity);
    
    return matchesTruck && matchesStartDate && matchesEndDate && matchesLoadCapacity;
  });

  // Get unique truck numbers for the filter dropdown
  const uniqueTruckNumbers = [...new Set(trips.map(trip => 
    trip.truck ? `${trip.truck.truck_number} (${trip.truck.model} - ${trip.truck.capacity} Ton)` : ''
  ).filter(Boolean))];

  // Get unique truck load capacities for the filter dropdown
  const uniqueLoadCapacities = [...new Set(trips.map(trip => 
    trip.truck ? trip.truck.capacity : null
  ).filter(Boolean))];

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const exportToExcel = (data, filename = "all_trips.xlsx") => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AllTrips");
    XLSX.writeFile(workbook, filename);
  };

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
              ${tripsToPrint.map(trip => {
                const exportObj = mapTripToExport(trip);
                return `
                <tr>
                  <td>${exportObj["Trip Number"] || ''}</td>
                  <td>${exportObj["Truck"] || ''}</td>
                  <td>${exportObj["Driver Name"] || ''}</td>
                  <td>${exportObj["Start Date"] ? new Date(exportObj["Start Date"]).toLocaleDateString() : ''}</td>
                  <td>${exportObj["End Date"] ? new Date(exportObj["End Date"]).toLocaleDateString() : ''}</td>
                  <td>${exportObj["From"] || ''}</td>
                  <td>${exportObj["To"] || ''}</td>
                  <td>${exportObj["Party Name"] || ''}</td>
                  <td>${exportObj["Compressor"] || ''}</td>
                  <td>${exportObj["Start KM"] || 0}</td>
                  <td>${exportObj["End KM"] || 0}</td>
                  <td>${exportObj["Total KM"] || 0}</td>
                  <td>${Number(trip.fuel_consumed || 0).toFixed(2)}</td>
                  <td>₹${Number(exportObj["Diesel Amount"] || 0).toFixed(2)}</td>
                  <td>₹${Number(exportObj["Toll"] || 0).toFixed(2)}</td>
                  <td>₹${Number(exportObj["Driver Salary"] || 0).toFixed(2)}</td>
                  <td>₹${Number(exportObj["Advanced Salary"] || 0).toFixed(2)}</td>
                  <td>₹${Number(exportObj["Maintenance"] || 0).toFixed(2)}</td>
                  <td>₹${Number(exportObj["Freight"] || 0).toFixed(2)}</td>
                  <td>${exportObj["Weight"] || 0}</td>
                  <td>₹${Number(exportObj["Total Freight"] || 0).toFixed(2)}</td>
                  <td>₹${Number(exportObj["Total Expenses"] || 0).toFixed(2)}</td>
                  <td>₹${Number(exportObj["Total Profit"] || 0).toFixed(2)}</td>
                  <td>₹${Number(exportObj["Per Day Profit"] || 0).toFixed(2)}</td>
                </tr>
              `}).join('')}
              <tr class="total-row">
                <td colspan="12">Total</td>
                <td>${tripsToPrint.reduce((sum, t) => sum + Number(t.fuel_consumed || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.diesel_amount || t.dieselAmount || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.toll || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.driver_salary || t.driverSalary || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.advanced_salary || t.advancedSalary || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.maintenance || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.freight || 0), 0).toFixed(2)}</td>
                <td></td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.total_freight || t.totalFreight || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.total_expenses || t.totalExpenses || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.total_profit || t.totalProfit || 0), 0).toFixed(2)}</td>
                <td>₹${tripsToPrint.reduce((sum, t) => sum + Number(t.per_day_profit || t.perDayProfit || 0), 0).toFixed(2)}</td>
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
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Truck Number</InputLabel>
            <Select
              value={filters.truckNumber}
              onChange={handleFilterChange('truckNumber')}
              label="Truck Number"
            >
              <MenuItem value="">All Trucks</MenuItem>
              {uniqueTruckNumbers.map(truckNumber => (
                <MenuItem key={`truck-${truckNumber}`} value={truckNumber}>
                  {truckNumber}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Load Capacity</InputLabel>
            <Select
              value={filters.loadCapacity}
              onChange={handleFilterChange('loadCapacity')}
              label="Load Capacity"
            >
              <MenuItem value="">All Capacities</MenuItem>
              {uniqueLoadCapacities.map(capacity => (
                <MenuItem key={`capacity-${capacity}`} value={capacity}>
                  {capacity} Ton
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
                {columns.map(col => {
                  let value = exportObj[col];
                  // Format currency values
                  if (col.includes('Amount') || col.includes('Salary') || col.includes('Toll') || 
                      col.includes('Freight') || col.includes('Expenses') || col.includes('Profit')) {
                    value = `₹${Number(value || 0).toFixed(2)}`;
                  }
                  // Format dates
                  if (col.includes('Date') && value) {
                    value = new Date(value).toLocaleDateString();
                  }
                  // Format numeric values without currency symbol
                  if (col === 'Diesel Qty' || col === 'Start KM' || col === 'End KM' || 
                      col === 'Total KM' || col === 'Weight') {
                    value = Number(value || 0).toFixed(2);
                  }
                  return <TableCell key={`${t.id}-${col}`}>{value}</TableCell>;
                })}
                <TableCell>
                  <Tooltip title="Export Excel">
                    <IconButton size="small" onClick={() => exportToExcel([exportObj], `trip_${t.trip_number || t.tripNumber}.xlsx`)}>
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