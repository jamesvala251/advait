import React, { useState } from "react";
import { Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, Select, MenuItem } from "@mui/material";

export default function TruckManager({ trucks, setTrucks }) {
  const [form, setForm] = useState({ truckNumber: "", loadCapacity: "", status: "Active" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = () => {
    if (!form.truckNumber) return;
    setTrucks([...trucks, { ...form, id: Date.now() }]);
    setForm({ truckNumber: "", loadCapacity: "", status: "Active" });
  };

  const handleDelete = (id) => setTrucks(trucks.filter((t) => t.id !== id));

  return (
    <div>
      <h2>Truck Management</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <TextField label="Truck Number" name="truckNumber" value={form.truckNumber} onChange={handleChange} />
        <TextField label="Load Capacity (Ton)" name="loadCapacity" value={form.loadCapacity} onChange={handleChange} />
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
            <TableCell>Delete</TableCell>
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
    </div>
  );
} 