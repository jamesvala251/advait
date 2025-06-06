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
  Tooltip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { truckExpenseService } from "../services/api";

export default function TruckExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [totals, setTotals] = useState({
    total_amount: 0,
    maintenance_total: 0,
    tyre_total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    truck_id: "",
    expense_type: "",
    start_date: "",
    end_date: ""
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState({
    id: null,
    truck_id: "",
    expense_type: "",
    date: "",
    amount: "",
    details: ""
  });

  const dialogButtonRef = useRef();

  // Fetch all trucks and expenses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trucksResponse, expensesResponse] = await Promise.all([
          truckExpenseService.getTrucks(),
          truckExpenseService.getAll(filters)
        ]);
        console.log('Trucks response:', trucksResponse.data);
        console.log('Expenses response:', expensesResponse.data);
        setTrucks(trucksResponse.data?.data || []);
        // Map expenses to include truck data
        const expensesWithTrucks = (expensesResponse.data?.expenses || []).map(expense => {
          const truck = (trucksResponse.data?.data || []).find(t => t.id === expense.truck_id);
          return {
            ...expense,
            truck: truck || null
          };
        });
        setExpenses(expensesWithTrucks);
        setTotals(expensesResponse.data?.totals || {
          total_amount: 0,
          maintenance_total: 0,
          tyre_total: 0
        });
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handleFilterChange = (field) => (event) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      [field]: value || ""
    }));
  };

  const handleEditClick = async (id) => {
    try {
      const response = await truckExpenseService.getEditData(id);
      const { expense, trucks: availableTrucks } = response.data;
      setTrucks(availableTrucks);
      setCurrentExpense({
        id: expense.id,
        truck_id: expense.truck_id,
        expense_type: expense.expense_type,
        date: expense.date,
        amount: expense.amount,
        details: expense.details
      });
      setIsEditing(true);
      setOpenDialog(true);
    } catch (err) {
      setError('Failed to fetch expense data. Please try again.');
      console.error('Error fetching expense data:', err);
    }
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentExpense({
      id: null,
      truck_id: "",
      expense_type: "",
      date: "",
      amount: "",
      details: ""
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        const response = await truckExpenseService.update(currentExpense.id, currentExpense);
        setExpenses(prev => prev.map(expense => {
          if (expense.id === currentExpense.id) {
            return {
              ...expense,
              ...response.data,
              truck: response.data.truck || expense.truck,
              date: response.data.date || currentExpense.date,
              amount: response.data.amount || currentExpense.amount,
              expense_type: response.data.expense_type || currentExpense.expense_type,
              details: response.data.details || currentExpense.details
            };
          }
          return expense;
        }));
      } else {
        const response = await truckExpenseService.create(currentExpense);
        setExpenses(prev => [...prev, {
          ...response.data,
          truck: response.data.truck || { truck_number: 'N/A' },
          date: response.data.date || currentExpense.date,
          amount: response.data.amount || currentExpense.amount,
          expense_type: response.data.expense_type || currentExpense.expense_type,
          details: response.data.details || currentExpense.details
        }]);
      }
      setOpenDialog(false);
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'add'} expense. Please try again.`);
      console.error(`Error ${isEditing ? 'updating' : 'adding'} expense:`, err);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await truckExpenseService.delete(id);
        setExpenses(prev => prev.filter(expense => expense.id !== id));
      } catch (err) {
        setError('Failed to delete expense. Please try again.');
        console.error('Error deleting expense:', err);
      }
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Truck Expenses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          ref={dialogButtonRef}
        >
          Add Expense
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Truck</InputLabel>
            <Select
              value={filters.truck_id || ""}
              onChange={handleFilterChange('truck_id')}
              label="Truck"
            >
              <MenuItem key="all-trucks" value="">All Trucks</MenuItem>
              {trucks.map((truck) => (
                <MenuItem key={`truck-${truck.id}`} value={truck.id}>
                  {truck.truck_number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Expense Type</InputLabel>
            <Select
              value={filters.expense_type || ""}
              onChange={handleFilterChange('expense_type')}
              label="Expense Type"
            >
              <MenuItem key="all-types" value="">All Types</MenuItem>
              <MenuItem key="maintenance" value="maintenance">Maintenance</MenuItem>
              <MenuItem key="tyre" value="tyre">Tyre</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={filters.start_date || ""}
            onChange={handleFilterChange('start_date')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
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
                <TableCell>Truck Number</TableCell>
                <TableCell>Expense Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Details</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => {
                // Find the truck for this expense
                const truck = trucks.find(t => t.id === expense.truck_id);
                return (
                  <TableRow key={`expense-${expense.id}`}>
                    <TableCell>
                      {truck ? truck.truck_number : 'N/A'}
                    </TableCell>
                    <TableCell>{expense.expense_type || 'N/A'}</TableCell>
                    <TableCell>
                      {expense.date ? new Date(expense.date).toLocaleDateString('en-GB') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {expense.amount ? `₹${Number(expense.amount).toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell>{expense.details || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Expense">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(expense.id)}
                          ref={dialogButtonRef}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Expense">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow key="totals-row">
                <TableCell colSpan={3} align="right"><strong>Totals:</strong></TableCell>
                <TableCell><strong>₹{Number(totals.total_amount).toFixed(2)}</strong></TableCell>
                <TableCell colSpan={2}>
                  <Typography variant="body2" color="text.secondary">
                    Maintenance: ₹{Number(totals.maintenance_total).toFixed(2)} | 
                    Tyre: ₹{Number(totals.tyre_total).toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </>
      )}

      {/* Add/Edit Expense Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          dialogButtonRef.current?.focus();
        }}
        aria-labelledby="expense-dialog-title"
        keepMounted={false}
        disableEnforceFocus
        disableAutoFocus
        disablePortal
        container={document.body}
        hideBackdrop={false}
        disableScrollLock
        PaperProps={{
          elevation: 24,
          sx: {
            position: 'relative',
            zIndex: 1300
          }
        }}
        BackdropProps={{
          sx: {
            position: 'fixed',
            zIndex: 1299
          }
        }}
      >
        <DialogTitle id="expense-dialog-title">
          {isEditing ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Truck</InputLabel>
                <Select
                  value={currentExpense.truck_id}
                  onChange={(e) => setCurrentExpense(prev => ({ ...prev, truck_id: e.target.value }))}
                  label="Truck"
                  MenuProps={{
                    disablePortal: true,
                    container: document.body
                  }}
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
              <FormControl fullWidth>
                <InputLabel>Expense Type</InputLabel>
                <Select
                  value={currentExpense.expense_type}
                  onChange={(e) => setCurrentExpense(prev => ({ ...prev, expense_type: e.target.value }))}
                  label="Expense Type"
                >
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="tyre">Tyre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={currentExpense.date}
                onChange={(e) => setCurrentExpense(prev => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Amount"
                value={currentExpense.amount}
                onChange={(e) => setCurrentExpense(prev => ({ ...prev, amount: e.target.value }))}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Details"
                value={currentExpense.details}
                onChange={(e) => setCurrentExpense(prev => ({ ...prev, details: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={!currentExpense.truck_id || !currentExpense.expense_type || !currentExpense.date || !currentExpense.amount || !currentExpense.details}
          >
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 