import React, { useState } from "react";
import { TextField, Button, MenuItem, Select, Autocomplete, Grid, InputLabel, FormControl } from "@mui/material";

const gujaratCities = [
  "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar",
  "Junagadh", "Anand", "Nadiad", "Navsari", "Morbi", "Bharuch", "Mehsana", "Tulsigam"
  // ...add more as needed
];

const initialForm = {
  truckNumber: "",
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

export default function TripEntryForm({ trucks, addTrip }) {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const requiredFields = [
    "truckNumber", "startDate", "endDate", "from", "to", "partyName", "startKm", "endKm", "dieselQty", "dieselAmount", "toll", "driverSalary", "advancedSalary", "driverName", "maintenance", "freight", "weight"
  ];

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Always update the state so the user can type
    const newForm = { ...form, [name]: value };

    // Validate End KM is greater than Start KM, but do not block typing
    let error = "";
    if ((name === 'startKm' || name === 'endKm')) {
      const startKm = Number(name === 'startKm' ? value : newForm.startKm) || 0;
      const endKm = Number(name === 'endKm' ? value : newForm.endKm) || 0;
      if (newForm.startKm !== "" && newForm.endKm !== "" && endKm <= startKm) {
        error = "End KM must be greater than Start KM";
      }
      // Calculate Total KM if both are valid numbers
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
        name === 'advancedSalary' || name === 'maintenance') {
      const dieselAmount = Number(newForm.dieselAmount) || 0;
      const toll = Number(newForm.toll) || 0;
      const driverSalary = Number(newForm.driverSalary) || 0;
      const advancedSalary = Number(newForm.advancedSalary) || 0;
      const maintenance = Number(newForm.maintenance) || 0;
      newForm.totalExpenses = dieselAmount + toll + driverSalary + advancedSalary + maintenance;
    }

    // Calculate Total Profit
    const totalFreight = Number(newForm.totalFreight) || 0;
    const totalExpenses = Number(newForm.totalExpenses) || 0;
    newForm.totalProfit = totalFreight - totalExpenses;

    // Calculate Per Day Profit
    const startDate = new Date(newForm.startDate);
    const endDate = new Date(newForm.endDate);
    const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    newForm.perDayProfit = newForm.totalProfit / days;

    setForm(newForm);
    setFormError(error); // Only set error, do not block typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Client-side validation for required fields
    const missing = requiredFields.filter(f => !form[f] && form[f] !== 0);
    if (missing.length > 0) {
      setFormError("Please fill all required fields: " + missing.join(", "));
      return;
    }
    setFormError("");
    addTrip({
      ...form,
      id: Date.now(),
      totalFreight,
      totalKm,
      totalExpenses,
      totalProfit,
      perDayProfit,
    });
    setForm(initialForm);
    setSuccessMsg("Trip added successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Trip Entry</h2>
      {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}
      {successMsg && <div style={{ color: 'green', marginBottom: 8 }}>{successMsg}</div>}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Truck Number</InputLabel>
            <Select
              name="truckNumber"
              value={form.truckNumber}
              onChange={handleChange}
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
          <TextField 
            label="Start KM" 
            name="startKm" 
            type="number" 
            value={form.startKm === undefined || form.startKm === null ? '' : form.startKm} 
            onChange={handleInputChange}
            fullWidth 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField 
            label="End KM" 
            name="endKm" 
            type="number" 
            value={form.endKm === undefined || form.endKm === null ? '' : form.endKm} 
            onChange={handleInputChange}
            error={!!formError && formError.includes('End KM')}
            helperText={!!formError && formError.includes('End KM') ? formError : ''}
            fullWidth 
          />
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
      
      <div style={{ marginTop: 16, marginBottom: 16 }}>
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