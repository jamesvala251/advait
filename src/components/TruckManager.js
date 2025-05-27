import React, { useState } from "react";
import { Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, Select, MenuItem, Snackbar, Alert } from "@mui/material";

export default function TruckManager({ trucks, setTrucks }) {
  const [form, setForm] = useState({ truckNumber: "", loadCapacity: "", status: "Active" });
  const [message, setMessage] = useState({ text: "", type: "success", open: false });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    if (!form.truckNumber) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/trucks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          truckNumber: form.truckNumber,
          loadCapacity: form.loadCapacity ? parseFloat(form.loadCapacity) : null,
          status: form.status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add truck');
      }

      const newTruck = await response.json();
      setTrucks([...trucks, newTruck]);
      setForm({ truckNumber: "", loadCapacity: "", status: "Active" });
      setMessage({ text: "Truck added successfully!", type: "success", open: true });
    } catch (error) {
      console.error('Error adding truck:', error);
      setMessage({ text: "Failed to add truck: " + error.message, type: "error", open: true });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/trucks/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete truck');
      }

      setTrucks(trucks.filter((t) => t.id !== id));
      setMessage({ text: "Truck deleted successfully!", type: "success", open: true });
    } catch (error) {
      console.error('Error deleting truck:', error);
      setMessage({ text: "Failed to delete truck: " + error.message, type: "error", open: true });
    }
  };

  const handleCloseMessage = () => {
    setMessage({ ...message, open: false });
  };

  return (
    <div>
      <h2>Truck Management</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <TextField 
          label="Truck Number" 
          name="truckNumber" 
          value={form.truckNumber} 
          onChange={handleChange}
          required 
        />
        <TextField 
          label="Load Capacity (Ton)" 
          name="loadCapacity" 
          type="number"
          value={form.loadCapacity} 
          onChange={handleChange}
          inputProps={{ step: "0.01" }}
        />
        <Select name="status" value={form.status} onChange={handleChange}>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </Select>
        <Button variant="contained" onClick={handleAdd}>Add Truck</Button>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Truck Number</TableCell>
            <TableCell>Load Capacity (Ton)</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trucks.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.truckNumber}</TableCell>
              <TableCell>{t.loadCapacity}</TableCell>
              <TableCell>{t.status}</TableCell>
              <TableCell>
                <Button color="error" onClick={() => handleDelete(t.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Snackbar 
        open={message.open} 
        autoHideDuration={6000} 
        onClose={handleCloseMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseMessage} severity={message.type} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </div>
  );
} 