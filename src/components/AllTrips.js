import React, { useState, useEffect, useRef } from "react";
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
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import * as XLSX from "xlsx";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { tripService } from '../services/api';
import TripEntryForm from "./TripEntryForm";
import { driverService } from '../services/api';

export default function AllTrips({ trips, trucks, onTripDelete, setTrips }) {
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [filters, setFilters] = useState({
    truckNumber: '',
    startDate: '',
    endDate: '',
    loadCapacity: '',
    month: new Date().toISOString().slice(0, 7) // Default to current month (YYYY-MM)
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [drivers, setDrivers] = useState([]);
  const editButtonRef = useRef();
  const deleteButtonRef = useRef();

  const columns = [
    "Trip Number", "Truck", "Driver Name", "Start Date", "End Date", "From", "To", "Party Name", "Compressor", "Start KM", "End KM", "Total KM", "Diesel Qty", "Diesel Amount", "Toll", "Driver Salary", "Advanced Salary", "Maintenance", "Freight", "Weight", "Total Freight", "Total Expenses", "Total Profit", "Per Day Profit"
  ];

  const mapTripToExport = (t) => {
    // Get diesel quantity from fuel_consumed field
    const dieselQty = t.fuel_consumed || 0;
    // Ensure we get the correct advanced salary value, preserving 0
    const advancedSalary = t.advanced_salary !== undefined ? t.advanced_salary : 
                          (t.advancedSalary !== undefined ? t.advancedSalary : 0);
    
    return {
      "Trip Number": t.trip_number || t.tripNumber,
      "Truck": t.truck ? `${t.truck.truck_number} (${t.truck.model})` : 'No Truck',
      "Driver Name": t.driver ? t.driver.name : 'No Driver',
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
      "Advanced Salary": Number(advancedSalary),
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
    
    // Add month filter
    const matchesMonth = !filters.month || 
      (tripStartDate && tripStartDate.startsWith(filters.month)) ||
      (tripEndDate && tripEndDate.startsWith(filters.month));
    
    return matchesTruck && matchesStartDate && matchesEndDate && matchesLoadCapacity && matchesMonth;
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
            .trip-card { 
              border: 1px solid #ddd; 
              margin-bottom: 20px; 
              padding: 15px;
              page-break-inside: avoid;
            }
            .trip-header {
              background-color: #f5f5f5;
              padding: 10px;
              margin-bottom: 10px;
              border-bottom: 2px solid #ddd;
            }
            .trip-details {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            .detail-item {
              display: flex;
              margin-bottom: 5px;
            }
            .detail-label {
              font-weight: bold;
              width: 150px;
            }
            .header { 
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .header-left {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
            }
            .header-right {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              text-align: right;
            }
            .logo {
              width: 110px;
              height: auto;
              margin-bottom: 10px;
            }
            .total-section {
              margin-top: 20px;
              padding: 10px;
              background-color: #f9f9f9;
              border-top: 2px solid #ddd;
            }
            @media print {
              .no-print { display: none; }
              .trip-card { margin-bottom: 30px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <img src="https://advaitroadmovers.com/logo.jpg" alt="Advait Road Movers" class="logo">
            </div>
            <div class="header-right">
              <h2>Trip Report</h2>
              <p>Generated on: ${new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          <div class="no-print">
            <button onclick="window.print()">Print Report</button>
          </div>
          ${tripsToPrint.map(trip => {
            const exportObj = mapTripToExport(trip);
            return `
            <div class="trip-card">
              <div class="trip-header">
                <h3>Trip Number: ${exportObj["Trip Number"] || ''}</h3>
                <p>${exportObj["Start Date"] ? new Date(exportObj["Start Date"]).toLocaleDateString('en-GB') : ''} to ${exportObj["End Date"] ? new Date(exportObj["End Date"]).toLocaleDateString('en-GB') : ''}</p>
              </div>
              <div class="trip-details">
                <div class="detail-item">
                  <span class="detail-label">Truck:</span>
                  <span>${exportObj["Truck"] || ''}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Driver Name:</span>
                  <span>${exportObj["Driver Name"] || ''}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Route:</span>
                  <span>${exportObj["From"] || ''} → ${exportObj["To"] || ''}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Party Name:</span>
                  <span>${exportObj["Party Name"] || ''}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Compressor:</span>
                  <span>${exportObj["Compressor"] || ''}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Start KM:</span>
                  <span>${exportObj["Start KM"] || 0}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">End KM:</span>
                  <span>${exportObj["End KM"] || 0}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Total KM:</span>
                  <span>${exportObj["Total KM"] || 0}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Diesel Qty:</span>
                  <span>${Number(trip.fuel_consumed || 0).toFixed(2)} L</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Diesel Amount:</span>
                  <span>${Number(exportObj["Diesel Amount"] || 0).toFixed(2)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Toll:</span>
                  <span>${Number(exportObj["Toll"] || 0).toFixed(2)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Driver Salary:</span>
                  <span>${Number(exportObj["Driver Salary"] || 0).toFixed(2)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Advanced Salary:</span>
                  <span>${Number(exportObj["Advanced Salary"] || 0).toFixed(2)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Maintenance:</span>
                  <span>${Number(exportObj["Maintenance"] || 0).toFixed(2)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Freight:</span>
                  <span>${Number(exportObj["Freight"] || 0).toFixed(2)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Weight:</span>
                  <span>${exportObj["Weight"] || 0}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Total Freight:</span>
                  <span>${Number(exportObj["Total Freight"] || 0).toFixed(2)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Total Expenses:</span>
                  <span>${Number(exportObj["Total Expenses"] || 0).toFixed(2)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Total Profit:</span>
                  <span>${Number(exportObj["Total Profit"] || 0).toFixed(2)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Per Day Profit:</span>
                  <span>${Number(exportObj["Per Day Profit"] || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          `}).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleDeleteClick = (trip) => {
    setTripToDelete(trip);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await tripService.delete(tripToDelete.id);
      onTripDelete(tripToDelete.id);
      setDeleteDialogOpen(false);
      setTripToDelete(null);
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Failed to delete trip');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTripToDelete(null);
    setDeleteError(null);
    deleteButtonRef.current?.focus();
  };

  const handleEditClick = (trip) => {
    setEditingTrip(trip);
    setEditForm({
      truckNumber: trip.truck?.truck_number || trip.truckNumber || "",
      driverName: trip.driver?.name || trip.driverName || "",
      startDate: trip.start_date || trip.startDate || "",
      endDate: trip.end_date || trip.endDate || "",
      from: trip.origin || trip.from || "",
      to: trip.destination || trip.to || "",
      partyName: trip.party_name || trip.partyName || "",
      compressor: trip.compressor || "No",
      startKm: trip.start_km || trip.startKm || "",
      endKm: trip.end_km || trip.endKm || "",
      dieselQty: trip.fuel_consumed || trip.dieselQty || "",
      dieselAmount: trip.diesel_amount || trip.dieselAmount || "",
      toll: trip.toll || "",
      driverSalary: trip.driver_salary || trip.driverSalary || "",
      advancedSalary: trip.advanced_salary !== undefined ? trip.advanced_salary : (trip.advancedSalary !== undefined ? trip.advancedSalary : ""),
      maintenance: trip.maintenance || "",
      freight: trip.freight || "",
      weight: trip.weight || "",
      totalFreight: trip.total_freight || trip.totalFreight || "",
      totalKm: trip.total_km || trip.totalKm || "",
      totalExpenses: trip.total_expenses || trip.totalExpenses || "",
      totalProfit: trip.total_profit || trip.totalProfit || "",
      perDayProfit: trip.per_day_profit || trip.perDayProfit || ""
    });
    setEditDialogOpen(true);
    setEditError("");
    setEditSuccess("");
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    // Always update the state so the user can type
    const newForm = { ...editForm, [name]: value };

    // Special handling for Advanced Salary
    if (name === 'advancedSalary') {
      newForm.advancedSalary = value === '' ? '' : Number(value);
    }

    // Rest of the validation and calculations...
    let error = "";
    if ((name === 'startKm' || name === 'endKm')) {
      const startKm = Number(name === 'startKm' ? value : newForm.startKm) || 0;
      const endKm = Number(name === 'endKm' ? value : newForm.endKm) || 0;
      if (newForm.startKm !== "" && newForm.endKm !== "" && endKm <= startKm) {
        error = "End KM must be greater than Start KM";
      }
      if (!error && newForm.startKm !== "" && newForm.endKm !== "") {
        newForm.totalKm = endKm - startKm;
      } else {
        newForm.totalKm = "";
      }
    }

    // Calculate Total Freight
    if (name === 'freight' || name === 'weight') {
      const freight = Number(newForm.freight) || 0;
      const weight = Number(newForm.weight) || 0;
      newForm.totalFreight = freight * weight;
    }

    // Calculate Total Expenses
    if (name === 'dieselAmount' || name === 'toll' || name === 'driverSalary' || 
        name === 'maintenance') {
      const dieselAmount = Number(newForm.dieselAmount) || 0;
      const toll = Number(newForm.toll) || 0;
      const driverSalary = Number(newForm.driverSalary) || 0;
      const maintenance = Number(newForm.maintenance) || 0;
      newForm.totalExpenses = dieselAmount + toll + driverSalary + maintenance;
    }

    // Calculate Total Profit and Per Day Profit
    if (name === 'dieselAmount' || name === 'toll' || name === 'driverSalary' || 
        name === 'maintenance' || name === 'freight' || name === 'weight' || 
        name === 'startDate' || name === 'endDate') {
      const totalFreight = Number(newForm.totalFreight) || 0;
      const totalExpenses = Number(newForm.totalExpenses) || 0;
      newForm.totalProfit = totalFreight - totalExpenses;

      const startDate = new Date(newForm.startDate);
      const endDate = new Date(newForm.endDate);
      const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
      newForm.perDayProfit = newForm.totalProfit / days;
    }

    setEditForm(newForm);
    setEditError(error);
  };

  const toDateString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d)) return '';
    return d.toISOString().slice(0, 10);
  };

  const handleEditSave = async () => {
    try {
      setEditError("");
      setEditSuccess("");
      // Prepare payload with camelCase keys and truckNumber/driverName
      const payload = {
        truckNumber: editForm.truckNumber,
        driverName: editForm.driverName,
        from: editForm.from,
        to: editForm.to,
        startDate: toDateString(editForm.startDate),
        endDate: toDateString(editForm.endDate),
        partyName: editForm.partyName,
        compressor: editForm.compressor,
        startKm: Number(editForm.startKm),
        endKm: Number(editForm.endKm),
        dieselQty: Number(editForm.dieselQty),
        dieselAmount: Number(editForm.dieselAmount),
        toll: Number(editForm.toll),
        driverSalary: Number(editForm.driverSalary),
        advancedSalary: editForm.advancedSalary === '' ? 0 : Number(editForm.advancedSalary),
        maintenance: Number(editForm.maintenance),
        freight: Number(editForm.freight),
        weight: Number(editForm.weight),
        totalFreight: Number(editForm.totalFreight),
        totalKm: Number(editForm.totalKm),
        totalExpenses: Number(editForm.totalExpenses),
        totalProfit: Number(editForm.totalProfit),
        perDayProfit: Number(editForm.perDayProfit)
      };

      // Check for missing required fields
      const requiredFields = [
        'truckNumber', 'driverName', 'from', 'to', 'startDate', 'endDate', 'partyName', 'startKm', 'endKm',
        'dieselQty', 'dieselAmount', 'toll', 'driverSalary', 'advancedSalary', 'maintenance', 'freight', 'weight',
        'totalFreight', 'totalKm', 'totalExpenses', 'totalProfit', 'perDayProfit'
      ];
      const missing = requiredFields.filter(f => payload[f] === undefined || payload[f] === null || payload[f] === '' || (typeof payload[f] === 'number' && isNaN(payload[f])));
      if (missing.length > 0) {
        setEditError('Please fill all required fields: ' + missing.join(', '));
        return;
      }

      const response = await tripService.update(editingTrip.id, payload);
      
      // Update trips state with the response data from the backend
      if (setTrips) {
        setTrips(prevTrips => {
          const updatedTrips = prevTrips.map(trip => 
            trip.id === editingTrip.id ? {
              ...response.data,
              // Ensure we use the correct advanced salary value from the response
              advancedSalary: response.data.advanced_salary,
              advanced_salary: response.data.advanced_salary,
              // Recalculate total expenses without advanced salary
              totalExpenses: Number(response.data.diesel_amount) + 
                           Number(response.data.toll) + 
                           Number(response.data.driver_salary) + 
                           Number(response.data.maintenance),
              // Recalculate total profit
              totalProfit: Number(response.data.total_freight) - 
                          (Number(response.data.diesel_amount) + 
                           Number(response.data.toll) + 
                           Number(response.data.driver_salary) + 
                           Number(response.data.maintenance))
            } : trip
          );
          return updatedTrips;
        });
      }

      // Trigger a custom event to notify other components about the trip update
      const event = new CustomEvent('tripUpdated', { 
        detail: { 
          tripId: editingTrip.id,
          driverId: response.data.driver_id,
          advancedSalary: response.data.advanced_salary
        } 
      });
      window.dispatchEvent(event);

      setEditSuccess("Trip updated successfully.");
      setEditError("");
      setEditDialogOpen(false);
      setEditingTrip(null);
    } catch (err) {
      let msg = "Failed to update trip.";
      if (err.response?.data?.message) msg += " " + err.response.data.message;
      if (err.response?.data?.errors) msg += " " + JSON.stringify(err.response.data.errors);
      msg += "\nFull error: " + JSON.stringify(err, Object.getOwnPropertyNames(err));
      setEditError(msg);
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingTrip(null);
    setEditError("");
    setEditSuccess("");
    editButtonRef.current?.focus();
  };

  // Helper to format date for input type="date"
  function toDateInputValue(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  }

  // Fetch drivers on mount
  useEffect(() => {
    async function fetchDrivers() {
      try {
        const response = await driverService.getAll();
        setDrivers(response.data?.data || response.data || []);
      } catch (err) {
        console.error('Error fetching drivers:', err);
      }
    }
    fetchDrivers();
  }, []);

  // Add this useEffect after all state declarations
  useEffect(() => {
    if (!editDialogOpen) {
      setEditError("");
      setEditSuccess("");
    }
  }, [editDialogOpen]);

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
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="month"
            label="Month"
            value={filters.month}
            onChange={handleFilterChange('month')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={filters.startDate}
            onChange={handleFilterChange('startDate')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="date"
            label="End Date"
            value={filters.endDate}
            onChange={handleFilterChange('endDate')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <Button
            variant="outlined"
            onClick={() => setFilters({
              truckNumber: '',
              startDate: '',
              endDate: '',
              loadCapacity: '',
              month: new Date().toISOString().slice(0, 7)
            })}
            fullWidth
          >
            Clear Filters
          </Button>
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
            <TableCell>Actions</TableCell>
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
                    // Ensure we handle 0 values correctly
                    const numValue = Number(value);
                    value = `${numValue.toFixed(2)}`;
                  }
                  // Format dates
                  if (col.includes('Date') && value) {
                    value = new Date(value).toLocaleDateString('en-GB');
                  }
                  // Format numeric values without currency symbol
                  if (col === 'Diesel Qty' || col === 'Start KM' || col === 'End KM' || 
                      col === 'Total KM' || col === 'Weight') {
                    value = `${Number(value).toFixed(2)}`;
                  }
                  // Special handling for truck display
                  if (col === 'Truck') {
                    value = t.truck ? `${t.truck.truck_number} (${t.truck.model})` : 'No Truck';
                  }
                  // Special handling for driver name
                  if (col === 'Driver Name') {
                    value = t.driver ? t.driver.name : 'No Driver';
                  }
                  return <TableCell key={`${t.id}-${col}`}>{value}</TableCell>;
                })}
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit Trip">
                      <IconButton size="small" color="primary" onClick={() => handleEditClick(t)} ref={editButtonRef}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export Excel">
                      <IconButton size="small" onClick={() => exportToExcel([exportObj], `trip_${t.trip_number || t.tripNumber}.xlsx`)}>
                        <FileDownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Trip">
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(t)} ref={deleteButtonRef}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Edit Trip Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleEditCancel} 
        maxWidth="md" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>Edit Trip</DialogTitle>
        <DialogContent>
          {editDialogOpen && editError && (
            <Typography color="error" sx={{ mb: 2 }}>{editError}</Typography>
          )}
          {editSuccess && <Typography color="success.main" sx={{ mb: 2 }}>{editSuccess}</Typography>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Truck Number</InputLabel>
                <Select
                  name="truckNumber"
                  value={editForm.truckNumber || ""}
                  onChange={handleEditFormChange}
                  label="Truck Number"
                >
                  <MenuItem value="">Select Truck</MenuItem>
                  {trucks.map((t) => (
                    <MenuItem key={t.id} value={t.truck_number}>
                      {t.truck_number} ({t.model} - {t.capacity} Ton)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Driver Name</InputLabel>
                <Select
                  name="driverName"
                  value={editForm.driverName || ""}
                  onChange={handleEditFormChange}
                  label="Driver Name"
                >
                  <MenuItem value="">Select Driver</MenuItem>
                  {[...new Set(drivers.map(d => d.name))]
                    .filter(name => name) // Filter out any null/undefined names
                    .map((name, index) => (
                      <MenuItem key={`driver-${index}`} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Start Date" name="startDate" type="date" value={toDateInputValue(editForm.startDate)} onChange={handleEditFormChange} InputLabelProps={{ shrink: true }} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="End Date" name="endDate" type="date" value={toDateInputValue(editForm.endDate)} onChange={handleEditFormChange} InputLabelProps={{ shrink: true }} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="From" name="from" value={editForm.from || ""} onChange={handleEditFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="To" name="to" value={editForm.to || ""} onChange={handleEditFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Party Name" name="partyName" value={editForm.partyName || ""} onChange={handleEditFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Compressor</InputLabel>
                <Select name="compressor" value={editForm.compressor || ""} onChange={handleEditFormChange}>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                label="Start KM" 
                name="startKm" 
                type="number" 
                value={editForm.startKm === undefined || editForm.startKm === null ? '' : editForm.startKm} 
                onChange={handleEditFormChange}
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                label="End KM" 
                name="endKm" 
                type="number" 
                value={editForm.endKm === undefined || editForm.endKm === null ? '' : editForm.endKm} 
                onChange={handleEditFormChange}
                error={!!editError && editError.includes('End KM')}
                helperText={!!editError && editError.includes('End KM') ? editError : ''}
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Diesel Qty" name="dieselQty" type="number" value={editForm.dieselQty || ""} onChange={handleEditFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Diesel Amount" name="dieselAmount" type="number" value={editForm.dieselAmount || ""} onChange={handleEditFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Toll" name="toll" type="number" value={editForm.toll || ""} onChange={handleEditFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Driver Salary" name="driverSalary" type="number" value={editForm.driverSalary || ""} onChange={handleEditFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                label="Advanced Salary" 
                name="advancedSalary" 
                type="number" 
                value={editForm.advancedSalary === undefined || editForm.advancedSalary === null ? '' : editForm.advancedSalary} 
                onChange={handleEditFormChange}
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Maintenance" name="maintenance" type="number" value={editForm.maintenance || ""} onChange={handleEditFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Freight" name="freight" type="number" value={editForm.freight || ""} onChange={handleEditFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Weight" name="weight" type="number" value={editForm.weight || ""} onChange={handleEditFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                label="Total KM" 
                name="totalKm" 
                type="number" 
                value={editForm.totalKm === undefined || editForm.totalKm === null ? '' : editForm.totalKm} 
                InputProps={{ readOnly: true }}
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                label="Total Freight" 
                name="totalFreight" 
                type="number" 
                value={editForm.totalFreight === undefined || editForm.totalFreight === null ? '' : editForm.totalFreight} 
                InputProps={{ readOnly: true }}
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                label="Total Expenses" 
                name="totalExpenses" 
                type="number" 
                value={editForm.totalExpenses === undefined || editForm.totalExpenses === null ? '' : editForm.totalExpenses} 
                InputProps={{ readOnly: true }}
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                label="Total Profit" 
                name="totalProfit" 
                type="number" 
                value={editForm.totalProfit === undefined || editForm.totalProfit === null ? '' : editForm.totalProfit} 
                InputProps={{ readOnly: true }}
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                label="Per Day Profit" 
                name="perDayProfit" 
                type="number" 
                value={editForm.perDayProfit === undefined || editForm.perDayProfit === null ? '' : editForm.perDayProfit} 
                InputProps={{ readOnly: true }}
                fullWidth 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>Delete Trip</DialogTitle>
        <DialogContent>
          {deleteError ? (
            <Typography color="error">{deleteError}</Typography>
          ) : (
            <Typography>
              Are you sure you want to delete trip {tripToDelete?.trip_number || tripToDelete?.tripNumber}?
              This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 