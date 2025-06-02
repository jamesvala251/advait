import React, { useState, useEffect } from "react";
import { 
  Button, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  TextField, 
  Select, 
  MenuItem, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
  Grid,
  Paper,
  Box
} from "@mui/material";
import { truckService } from "../services/api";

export default function TruckManager({ trucks, setTrucks }) {
  const [form, setForm] = useState({ 
    truck_number: "", 
    capacity: "", 
    status: "active",
    model: "Default" 
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, truckId: null, truckNumber: '' });
  const [successMessage, setSuccessMessage] = useState('');

  // Add useEffect to log trucks data changes
  useEffect(() => {
    console.log('Current trucks data:', trucks);
  }, [trucks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    // Check if truck number is empty
    if (!form.truck_number.trim()) {
      setError("Truck number is required");
      return false;
    }

    // Check if truck number already exists
    const trucksArray = trucks?.data || [];
    const truckNumberExists = trucksArray.some(
      truck => truck.truck_number.toLowerCase() === form.truck_number.toLowerCase()
    );
    
    if (truckNumberExists) {
      setError("A truck with this number already exists");
      return false;
    }

    // Check if capacity is a valid number
    if (form.capacity && isNaN(form.capacity)) {
      setError("Load capacity must be a valid number");
      return false;
    }

    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      // Format the data to match the API expectations
      const truckData = {
        truck_number: form.truck_number.trim(),
        capacity: form.capacity ? parseInt(form.capacity) : null,
        status: form.status,
        model: form.model || "Default"
      };

      // Log the exact data being sent
      console.log('Sending truck data:', JSON.stringify(truckData, null, 2));
      
      const response = await truckService.create(truckData);
      console.log('Server response:', response.data);
      
      if (response.data) {
        // Update trucks state with the new truck
        const currentTrucks = trucks?.data || [];
        const updatedTrucks = [...currentTrucks, response.data];
        console.log('Updated trucks array:', updatedTrucks);
        setTrucks({ data: updatedTrucks });
        
        // Reset form
        setForm({ 
          truck_number: "", 
          capacity: "", 
          status: "active",
          model: "Default" 
        });

        setSuccessMessage('Truck added successfully');
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      
      let errorMessage = 'Failed to add truck. ';
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (truck) => {
    setDeleteDialog({
      open: true,
      truckId: truck.id,
      truckNumber: truck.truck_number
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Deleting truck:', deleteDialog.truckId);
      
      const response = await truckService.delete(deleteDialog.truckId);
      console.log('Delete response:', response);
      
      if (response.status === 200) {
        // Fetch updated trucks list after successful deletion
        const updatedTrucksResponse = await truckService.getAll();
        setTrucks(updatedTrucksResponse.data);
        
        setSuccessMessage('Truck deleted successfully');
      }
      
      // Close the dialog
      setDeleteDialog({ open: false, truckId: null, truckNumber: '' });
    } catch (err) {
      console.error('Delete error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Failed to delete truck. ';
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, truckId: null, truckNumber: '' });
  };

  // Add function to refresh trucks data
  const refreshTrucks = async () => {
    try {
      setLoading(true);
      const response = await truckService.getAll();
      console.log('Fetched trucks:', response.data);
      setTrucks(response.data);
      setSuccessMessage('Trucks list refreshed');
    } catch (err) {
      console.error('Error fetching trucks:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Failed to fetch trucks. ';
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Call refreshTrucks when component mounts
  useEffect(() => {
    refreshTrucks();
  }, []);

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };

  return (
    <div>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
        Truck Management
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              fullWidth
              label="Truck Number" 
              name="truck_number" 
              value={form.truck_number} 
              onChange={handleChange}
              disabled={loading}
              required
              error={!!error && error.includes("truck number")}
              helperText={error && error.includes("truck number") ? error : ""}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              fullWidth
              label="Load Capacity (Ton)" 
              name="capacity" 
              value={form.capacity} 
              onChange={handleChange}
              disabled={loading}
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Select
              fullWidth
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={loading}
              displayEmpty
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAdd}
              disabled={loading}
              sx={{ height: '56px' }}
            >
              Add Truck
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Truck Number</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Load Capacity</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trucks?.data?.map((truck) => (
            <TableRow key={truck.id}>
              <TableCell>{truck.truck_number}</TableCell>
              <TableCell>{truck.model}</TableCell>
              <TableCell>{truck.capacity} Ton</TableCell>
              <TableCell>{truck.status}</TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(truck)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete truck {deleteDialog.truckNumber}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </div>
  );
} 