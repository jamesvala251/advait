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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Modal,
  Checkbox
} from "@mui/material";
import { 
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { truckService, loadDetailService } from "../services/api";
import * as XLSX from 'xlsx';

export default function LoadDetails() {
  const [loads, setLoads] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLoad, setCurrentLoad] = useState({
    id: null,
    date: "",
    truck_id: "",
    location: "",
    load_qty: "",
    diesel_amount: "",
    freight: "",
    total_freight: "",
    advance_payment: "",
    commission: "",
    balance_payment: ""
  });
  const [selectedLoads, setSelectedLoads] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    truckId: ''
  });

  const dialogButtonRef = useRef();

  // Fetch all trucks and loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trucksResponse, loadsResponse] = await Promise.all([
          truckService.getAll(),
          loadDetailService.getAll()
        ]);
        console.log('Trucks response:', trucksResponse.data);
        console.log('Loads response:', loadsResponse.data);
        setTrucks(trucksResponse.data?.data || []);
        setLoads(loadsResponse.data?.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate total freight and balance payment
  useEffect(() => {
    if (currentLoad.freight && currentLoad.load_qty) {
      const total = Number(currentLoad.freight) * Number(currentLoad.load_qty);
      const balance = total - (Number(currentLoad.advance_payment) || 0) - (Number(currentLoad.commission) || 0) - (Number(currentLoad.diesel_amount) || 0);
      setCurrentLoad(prev => ({
        ...prev,
        total_freight: total.toFixed(2),
        balance_payment: balance.toFixed(2)
      }));
    }
  }, [currentLoad.freight, currentLoad.load_qty, currentLoad.advance_payment, currentLoad.commission, currentLoad.diesel_amount]);

  // Filter loads based on selected criteria
  const filteredLoads = loads.filter(load => {
    const loadDate = new Date(load.date);
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;
    
    const dateInRange = (!startDate || loadDate >= startDate) && 
                        (!endDate || loadDate <= endDate);
    const truckMatch = !filters.truckId || load.truck_id === filters.truckId;
    
    return dateInRange && truckMatch;
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      truckId: ''
    });
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentLoad({
      id: null,
      date: "",
      truck_id: "",
      location: "",
      load_qty: "",
      diesel_amount: "",
      freight: "",
      total_freight: "",
      advance_payment: "",
      commission: "",
      balance_payment: ""
    });
    setOpenDialog(true);
  };

  const handleEditClick = (load) => {
    setIsEditing(true);
    setCurrentLoad({
      ...load,
      date: new Date(load.date).toISOString().split('T')[0],
      total_freight: (Number(load.freight) * Number(load.load_qty)).toFixed(2),
      balance_payment: ((Number(load.freight) * Number(load.load_qty)) - (Number(load.advance_payment) || 0) - (Number(load.commission) || 0)).toFixed(2)
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const loadData = {
        ...currentLoad,
        commission: currentLoad.commission || 0,
        date: new Date(currentLoad.date).toISOString()
      };

      if (isEditing) {
        const response = await loadDetailService.update(currentLoad.id, loadData);
        setLoads(prev => prev.map(load => 
          load.id === currentLoad.id ? response.data.data : load
        ));
      } else {
        const response = await loadDetailService.create(loadData);
        setLoads(prev => [...prev, response.data.data]);
      }
      setOpenDialog(false);
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'add'} load. Please try again.`);
      console.error(`Error ${isEditing ? 'updating' : 'adding'} load:`, err);
    }
  };

  const handleDeleteLoad = async (id) => {
    if (window.confirm('Are you sure you want to delete this load?')) {
      try {
        await loadDetailService.delete(id);
        setLoads(prev => prev.filter(load => load.id !== id));
      } catch (err) {
        setError('Failed to delete load. Please try again.');
        console.error('Error deleting load:', err);
      }
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedLoads(filteredLoads.map(load => load.id));
    } else {
      setSelectedLoads([]);
    }
  };

  const handleSelectLoad = (loadId) => {
    setSelectedLoads(prev => {
      if (prev.includes(loadId)) {
        return prev.filter(id => id !== loadId);
      } else {
        return [...prev, loadId];
      }
    });
  };

  const handlePrintSelected = () => {
    const selectedLoadsData = filteredLoads.filter(load => selectedLoads.includes(load.id));
    if (selectedLoadsData.length === 0) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Selected Load Details</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .footer { margin-top: 30px; text-align: center; }
            @media print {
              .no-print { display: none; }
              th, td { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Load Details Report</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Truck Number</th>
                <th>Location</th>
                <th>Load QTY</th>
                <th>Diesel Amount</th>
                <th>Freight</th>
                <th>Total Freight</th>
                <th>Advance Payment</th>
                <th>Commission</th>
                <th>Balance Payment</th>
              </tr>
            </thead>
            <tbody>
              ${selectedLoadsData.map(load => {
                const truck = trucks.find(t => t.id === load.truck_id);
                return `
                  <tr>
                    <td>${new Date(load.date).toLocaleDateString()}</td>
                    <td>${truck ? truck.truck_number : 'N/A'}</td>
                    <td>${load.location}</td>
                    <td>${load.load_qty}</td>
                    <td>₹${Number(load.diesel_amount).toFixed(2)}</td>
                    <td>₹${Number(load.freight).toFixed(2)}</td>
                    <td>₹${Number(load.total_freight).toFixed(2)}</td>
                    <td>₹${Number(load.advance_payment).toFixed(2)}</td>
                    <td>₹${Number(load.commission || 0).toFixed(2)}</td>
                    <td>₹${Number(load.balance_payment).toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Printed on: ${new Date().toLocaleString()}</p>
          </div>
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportExcel = () => {
    const selectedLoadsData = filteredLoads.filter(load => selectedLoads.includes(load.id));
    if (selectedLoadsData.length === 0) return;

    // Prepare data for Excel
    const excelData = selectedLoadsData.map(load => {
      const truck = trucks.find(t => t.id === load.truck_id);
      return {
        'Date': new Date(load.date).toLocaleDateString(),
        'Truck Number': truck ? truck.truck_number : 'N/A',
        'Location': load.location,
        'Load QTY': load.load_qty,
        'Diesel Amount': `₹${Number(load.diesel_amount).toFixed(2)}`,
        'Freight': `₹${Number(load.freight).toFixed(2)}`,
        'Total Freight': `₹${Number(load.total_freight).toFixed(2)}`,
        'Advance Payment': `₹${Number(load.advance_payment).toFixed(2)}`,
        'Commission': `₹${Number(load.commission || 0).toFixed(2)}`,
        'Balance Payment': `₹${Number(load.balance_payment).toFixed(2)}`
      };
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 15 }, // Truck Number
      { wch: 20 }, // Location
      { wch: 10 }, // Load QTY
      { wch: 15 }, // Diesel Amount
      { wch: 15 }, // Freight
      { wch: 15 }, // Total Freight
      { wch: 15 }, // Advance Payment
      { wch: 15 }, // Commission
      { wch: 15 }  // Balance Payment
    ];
    ws['!cols'] = columnWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Load Details');

    // Generate Excel file
    const fileName = `Load_Details_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3 
      }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          Market Trucks
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            disabled={selectedLoads.length === 0}
            fullWidth={false}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrintSelected}
            disabled={selectedLoads.length === 0}
            fullWidth={false}
          >
            Print Selected
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            fullWidth={false}
            ref={dialogButtonRef}
          >
            Add Load
          </Button>
        </Box>
      </Box>

      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Truck Number</InputLabel>
              <Select
                value={filters.truckId}
                onChange={(e) => handleFilterChange('truckId', e.target.value)}
                label="Truck Number"
              >
                <MenuItem value="">All Trucks</MenuItem>
                {trucks.map((truck) => (
                  <MenuItem key={truck.id} value={truck.id}>
                    {truck.truck_number}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              fullWidth
            >
              Clear Filters
            </Button>
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
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedLoads.length === filteredLoads.length && filteredLoads.length > 0}
                  indeterminate={selectedLoads.length > 0 && selectedLoads.length < filteredLoads.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Truck Number</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Load QTY</TableCell>
              <TableCell>Diesel Amount</TableCell>
              <TableCell>Freight</TableCell>
              <TableCell>Total Freight</TableCell>
              <TableCell>Advance Payment</TableCell>
              <TableCell>Commission</TableCell>
              <TableCell>Balance Payment</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLoads.map((load) => {
              const truck = trucks.find(t => t.id === load.truck_id);
              return (
                <TableRow key={load.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedLoads.includes(load.id)}
                      onChange={() => handleSelectLoad(load.id)}
                    />
                  </TableCell>
                  <TableCell>{new Date(load.date).toLocaleDateString()}</TableCell>
                  <TableCell>{truck ? truck.truck_number : 'N/A'}</TableCell>
                  <TableCell>{load.location}</TableCell>
                  <TableCell>{load.load_qty}</TableCell>
                  <TableCell>₹{Number(load.diesel_amount).toFixed(2)}</TableCell>
                  <TableCell>₹{Number(load.freight).toFixed(2)}</TableCell>
                  <TableCell>₹{Number(load.total_freight).toFixed(2)}</TableCell>
                  <TableCell>₹{Number(load.advance_payment).toFixed(2)}</TableCell>
                  <TableCell>₹{Number(load.commission || 0).toFixed(2)}</TableCell>
                  <TableCell>₹{Number(load.balance_payment).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Load">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(load)}
                        sx={{ mr: 1 }}
                        ref={dialogButtonRef}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Load">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteLoad(load.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Add/Edit Load Dialog */}
      <Modal
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          dialogButtonRef.current?.focus();
        }}
        aria-labelledby="load-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper sx={{ width: '90%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}>
          <DialogTitle id="load-dialog-title">
            {isEditing ? 'Edit Market Truck' : 'Add New Market Truck'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={currentLoad.date}
                  onChange={(e) => setCurrentLoad(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Truck Number</InputLabel>
                  <Select
                    value={currentLoad.truck_id}
                    onChange={(e) => setCurrentLoad(prev => ({ ...prev, truck_id: e.target.value }))}
                    label="Truck Number"
                  >
                    {Array.isArray(trucks) && trucks.map((truck) => (
                      <MenuItem key={truck.id} value={truck.id}>
                        {truck.truck_number}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={currentLoad.location}
                  onChange={(e) => setCurrentLoad(prev => ({ ...prev, location: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Load QTY"
                  value={currentLoad.load_qty}
                  onChange={(e) => setCurrentLoad(prev => ({ ...prev, load_qty: e.target.value }))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Freight"
                  value={currentLoad.freight}
                  onChange={(e) => setCurrentLoad(prev => ({ ...prev, freight: e.target.value }))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Freight"
                  value={currentLoad.total_freight}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Diesel Amount"
                  value={currentLoad.diesel_amount}
                  onChange={(e) => setCurrentLoad(prev => ({ ...prev, diesel_amount: e.target.value }))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Advance Payment"
                  value={currentLoad.advance_payment}
                  onChange={(e) => setCurrentLoad(prev => ({ ...prev, advance_payment: e.target.value }))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Commission"
                  value={currentLoad.commission}
                  onChange={(e) => setCurrentLoad(prev => ({ ...prev, commission: e.target.value }))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Balance Payment"
                  value={currentLoad.balance_payment}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSave}
              variant="contained"
              disabled={!currentLoad.date || !currentLoad.truck_id || !currentLoad.location || 
                       !currentLoad.load_qty || !currentLoad.diesel_amount || !currentLoad.freight}
            >
              {isEditing ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Paper>
      </Modal>
    </Paper>
  );
} 