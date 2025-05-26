import React, { useState } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, TextField, Button } from "@mui/material";
import * as XLSX from "xlsx";

export default function TripTable({ trips, trucks, clearTrips }) {
  const [filter, setFilter] = useState({ truck: "", from: "", to: "", start: "", end: "" });

  const handleChange = (e) => setFilter({ ...filter, [e.target.name]: e.target.value });

  const filtered = trips.filter((t) => {
    return (
      (!filter.truck || t.truckNumber === filter.truck) &&
      (!filter.from || t.from.toLowerCase().includes(filter.from.toLowerCase())) &&
      (!filter.to || t.to.toLowerCase().includes(filter.to.toLowerCase())) &&
      (!filter.start || t.startDate >= filter.start) &&
      (!filter.end || t.endDate <= filter.end)
    );
  });

  const exportToExcel = () => {
    const exportData = filtered.map(t => ({
      "Trip Number": t.tripNumber,
      "Driver Name": t.driverName,
      Truck: t.truckNumber,
      Dates: `${t.startDate} - ${t.endDate}`,
      Route: `${t.from} → ${t.to}`,
      "Total KM": t.totalKm,
      "Total Expenses": t.totalExpenses,
      "Total Profit": t.totalProfit,
      "Per Day Profit": t.perDayProfit && t.perDayProfit.toFixed(2)
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");
    XLSX.writeFile(workbook, "trip_profit_loss.xlsx");
  };

  return (
    <div>
      <h2>Trip Profit/Loss</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <Button variant="outlined" onClick={exportToExcel} disabled={filtered.length === 0}>
          Export to Excel
        </Button>
        {trips.length > 0 && (
          <Button variant="outlined" color="error" onClick={clearTrips}>
            Clear All Data
          </Button>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <Select name="truck" value={filter.truck} onChange={handleChange} displayEmpty>
          <MenuItem value="">All Trucks</MenuItem>
          {trucks.map((t) => (
            <MenuItem key={t.id} value={t.truckNumber}>
              {t.truckNumber}
            </MenuItem>
          ))}
        </Select>
        <TextField label="From" name="from" value={filter.from} onChange={handleChange} />
        <TextField label="To" name="to" value={filter.to} onChange={handleChange} />
        <TextField label="Start Date" name="start" type="date" value={filter.start} onChange={handleChange} InputLabelProps={{ shrink: true }} />
        <TextField label="End Date" name="end" type="date" value={filter.end} onChange={handleChange} InputLabelProps={{ shrink: true }} />
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Trip Number</TableCell>
            <TableCell>Driver Name</TableCell>
            <TableCell>Truck</TableCell>
            <TableCell>Dates</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Total KM</TableCell>
            <TableCell>Total Expenses</TableCell>
            <TableCell>Total Profit</TableCell>
            <TableCell>Per Day Profit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.tripNumber}</TableCell>
              <TableCell>{t.driverName}</TableCell>
              <TableCell>{t.truckNumber}</TableCell>
              <TableCell>
                {t.startDate} - {t.endDate}
              </TableCell>
              <TableCell>
                {t.from} → {t.to}
              </TableCell>
              <TableCell>{t.totalKm}</TableCell>
              <TableCell>{t.totalExpenses}</TableCell>
              <TableCell>{t.totalProfit}</TableCell>
              <TableCell>{t.perDayProfit && t.perDayProfit.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 