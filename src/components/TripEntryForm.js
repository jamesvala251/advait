import React, { useState, useEffect } from "react";
import { TextField, Button, MenuItem, Select, Autocomplete, Grid, InputLabel, FormControl } from "@mui/material";

const gujaratCities = [
  "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar",
  "Junagadh", "Anand", "Nadiad", "Navsari", "Morbi", "Bharuch", "Mehsana", "Tulsigam"
  // ...add more as needed
];

function getNextTripNumber(trips) {
  if (!trips || trips.length === 0) return 1;
  const nums = trips
    .map(t => parseInt(t.tripNumber, 10))
    .filter(n => !isNaN(n));
  return nums.length > 0 ? Math.max(...nums) + 1 : 1;
}

const initialForm = {
  truckNumber: "",
  tripNumber: 1,
  startDate: "",
  endDate: "",
  from: "",
  to: "",
  partyName: "",
  compressor: "No",
  startKm: "",
  endKm: "",
  dieselQty: "",
  dieselAmount: "",
  toll: "",
  driverSalary: "",
  advancedSalary: "",
  driverName: "",
  maintenance: "",
  freight: "",
  weight: "",
  // totalFreight and totalKm will be calculated
};

export default function TripEntryForm({ trucks, addTrip, trips = [] }) {
  const [form, setForm] = useState({ ...initialForm, tripNumber: getNextTripNumber(trips) });

  useEffect(() => {
    setForm(f => ({ ...f, tripNumber: getNextTripNumber(trips) }));
    // eslint-disable-next-line
  }, [trips]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Auto-calculate Total Freight
  const freight = parseFloat(form.freight) || 0;
  const weight = parseFloat(form.weight) || 0;
  const totalFreight = freight && weight ? parseFloat((freight * weight).toFixed(2)) : "";

  // Auto-calculate Total KM
  const startKm = parseInt(form.startKm) || 0;
  const endKm = parseInt(form.endKm) || 0;
  const totalKm = form.startKm !== "" && form.endKm !== "" ? endKm - startKm : "";

  // Calculations
  const totalExpenses =
    Number(form.dieselAmount || 0) +
    Number(form.toll || 0) +
    Number(form.driverSalary || 0) +
    Number(form.advancedSalary || 0) +
    Number(form.maintenance || 0) +
    Number(form.freight || 0);
  const totalProfit = totalFreight !== "" ? totalFreight - totalExpenses : "";
  const tripDays =
    form.startDate && form.endDate
      ? (new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24) + 1
      : 1;
  const perDayProfit = tripDays > 0 && totalProfit !== "" ? totalProfit / tripDays : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    addTrip({
      ...form,
      id: Date.now(),
      totalFreight,
      totalKm,
      totalExpenses,
      totalProfit,
      perDayProfit,
    });
    setForm({ ...initialForm, tripNumber: getNextTripNumber([...trips, { ...form, tripNumber: form.tripNumber }]) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Trip Entry</h2>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Select
            name="truckNumber"
            value={form.truckNumber}
            onChange={handleChange}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">Select Truck</MenuItem>
            {trucks.map((t) => (
              <MenuItem key={t.id} value={t.truckNumber}>
                {t.truckNumber}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Trip Number" name="tripNumber" value={form.tripNumber} InputProps={{ readOnly: true }} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Driver Name" name="driverName" value={form.driverName} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Start Date" name="startDate" type="date" value={form.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="End Date" name="endDate" type="date" value={form.endDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Autocomplete
            freeSolo
            options={gujaratCities}
            value={form.from}
            onInputChange={(event, newValue) => setForm({ ...form, from: newValue })}
            renderInput={(params) => <TextField {...params} label="From" name="from" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Autocomplete
            freeSolo
            options={gujaratCities}
            value={form.to}
            onInputChange={(event, newValue) => setForm({ ...form, to: newValue })}
            renderInput={(params) => <TextField {...params} label="To" name="to" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Party Name" name="partyName" value={form.partyName} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel id="compressor-label">Compressor</InputLabel>
            <Select
              labelId="compressor-label"
              label="Compressor"
              name="compressor"
              value={form.compressor}
              onChange={handleChange}
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Start KM" name="startKm" type="number" value={form.startKm} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="End KM" name="endKm" type="number" value={form.endKm} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Total KM" name="totalKm" type="number" value={totalKm} InputProps={{ readOnly: true }} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Diesel Qty" name="dieselQty" type="number" value={form.dieselQty} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Diesel Amount" name="dieselAmount" type="number" value={form.dieselAmount} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Toll" name="toll" type="number" value={form.toll} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Driver Salary" name="driverSalary" type="number" value={form.driverSalary} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Advanced Salary" name="advancedSalary" type="number" value={form.advancedSalary} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Maintenance" name="maintenance" type="number" value={form.maintenance} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Freight" name="freight" type="number" value={form.freight} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Weight" name="weight" type="number" value={form.weight} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Total Freight" name="totalFreight" type="number" value={totalFreight} InputProps={{ readOnly: true }} fullWidth />
        </Grid>
      </Grid>
      <div style={{ marginTop: 24, marginBottom: 8 }}>
        <b>Total KM:</b> {totalKm} &nbsp;
        <b>Total Expenses:</b> {totalExpenses} &nbsp;
        <b>Total Profit:</b> {totalProfit} &nbsp;
        <b>Per Day Profit:</b> {perDayProfit !== "" ? perDayProfit.toFixed(2) : ""}
      </div>
      <Button type="submit" variant="contained" style={{ marginTop: 16 }} fullWidth>
        Save Trip
      </Button>
    </form>
  );
} 