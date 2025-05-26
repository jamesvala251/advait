import React, { useState } from "react";
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from "@mui/material";

export default function TruckExpenses({ trucks, expenses, setExpenses }) {
  const [form, setForm] = useState({
    truckNumber: "",
    expenseDetail: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    expenseType: ""
  });

  const [filters, setFilters] = useState({
    truckNumber: "",
    expenseType: "",
    startDate: "",
    endDate: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.truckNumber || !form.expenseDetail || !form.amount || !form.expenseType) return;

    const newExpense = {
      id: Date.now(),
      ...form
    };

    setExpenses([...expenses, newExpense]);
    setForm({
      truckNumber: "",
      expenseDetail: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      expenseType: ""
    });
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesTruck = !filters.truckNumber || expense.truckNumber === filters.truckNumber;
    const matchesType = !filters.expenseType || expense.expenseType === filters.expenseType;
    const matchesDate = (!filters.startDate || expense.date >= filters.startDate) && 
                       (!filters.endDate || expense.date <= filters.endDate);
    return matchesTruck && matchesType && matchesDate;
  });

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Truck Expenses</Typography>

      {/* Add Expense Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add New Expense</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Truck Number</InputLabel>
                <Select
                  name="truckNumber"
                  value={form.truckNumber}
                  onChange={handleChange}
                  label="Truck Number"
                >
                  <MenuItem value="">Select Truck</MenuItem>
                  {trucks.map((truck) => (
                    <MenuItem key={truck.id} value={truck.truckNumber}>
                      {truck.truckNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Expense Type</InputLabel>
                <Select
                  name="expenseType"
                  value={form.expenseType}
                  onChange={handleChange}
                  label="Expense Type"
                >
                  <MenuItem value="">Select Type</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Tyre">Tyre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Expense Detail"
                name="expenseDetail"
                multiline
                rows={3}
                value={form.expenseDetail}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Add Expense
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Truck Number</InputLabel>
              <Select
                name="truckNumber"
                value={filters.truckNumber}
                onChange={handleFilterChange}
                label="Truck Number"
              >
                <MenuItem value="">All Trucks</MenuItem>
                {trucks.map((truck) => (
                  <MenuItem key={truck.id} value={truck.truckNumber}>
                    {truck.truckNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Expense Type</InputLabel>
              <Select
                name="expenseType"
                value={filters.expenseType}
                onChange={handleFilterChange}
                label="Expense Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Tyre">Tyre</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="End Date"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Expenses List */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Truck Number</TableCell>
            <TableCell>Expense Type</TableCell>
            <TableCell>Expense Detail</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredExpenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{expense.date}</TableCell>
              <TableCell>{expense.truckNumber}</TableCell>
              <TableCell>{expense.expenseType}</TableCell>
              <TableCell>{expense.expenseDetail}</TableCell>
              <TableCell>₹{Number(expense.amount).toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  color="error"
                  size="small"
                  onClick={() => handleDelete(expense.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
} 