import React, { useState, useEffect } from "react";
import { trucks as testTrucks, trips as testTrips } from "./data/testData";
import TruckManager from "./components/TruckManager";
import TripEntryForm from "./components/TripEntryForm";
import TripTable from "./components/TripTable";
import Reports from "./components/Reports";
import AllTrips from "./components/AllTrips";
import DriverReports from "./components/DriverReports";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Container,
  Paper,
  Box,
  useMediaQuery,
  IconButton
} from "@mui/material";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const TRUCKS_KEY = "trucks_data";
const TRIPS_KEY = "trips_data";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#1565c0',
    },
  },
});

const NAV = [
  { label: "Trip Entry", icon: <AssignmentIcon />, value: "entry" },
  { label: "All Trips", icon: <TableChartIcon />, value: "alltrips" },
  { label: "Truck Management", icon: <DirectionsCarIcon />, value: "trucks" },
  { label: "Profit/Loss", icon: <TableChartIcon />, value: "profit" },
  { label: "Reports", icon: <BarChartIcon />, value: "reports" },
  { label: "Driver Reports", icon: <PersonIcon />, value: "driverreports" },
];

function App() {
  // Load from localStorage or fallback to test data
  const [trucks, setTrucks] = useState(() => {
    const stored = localStorage.getItem(TRUCKS_KEY);
    return stored ? JSON.parse(stored) : testTrucks;
  });
  const [trips, setTrips] = useState(() => {
    const stored = localStorage.getItem(TRIPS_KEY);
    return stored ? JSON.parse(stored) : testTrips;
  });
  const [page, setPage] = useState("entry");

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(TRUCKS_KEY, JSON.stringify(trucks));
  }, [trucks]);
  useEffect(() => {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  }, [trips]);

  const addTrip = (trip) => setTrips([...trips, trip]);

  const clearTrips = () => {
    setTrips([]);
    localStorage.setItem(TRIPS_KEY, JSON.stringify([]));
  };

  // Responsive tab orientation
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            Advait Road Movers
          </Typography>
          <Tabs
            value={page}
            onChange={(_, v) => setPage(v)}
            textColor="inherit"
            indicatorColor="secondary"
            orientation={isMobile ? "vertical" : "horizontal"}
            variant={isMobile ? "scrollable" : "standard"}
            sx={{ minHeight: 48 }}
          >
            {NAV.map((nav) => (
              <Tab
                key={nav.value}
                icon={nav.icon}
                iconPosition="start"
                label={nav.label}
                value={nav.value}
                sx={{ minHeight: 48, fontWeight: page === nav.value ? 700 : 400 }}
              />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 0, sm: 2 } }}>
        <Paper elevation={3} sx={{ p: { xs: 1, sm: 3 }, mt: 4, maxWidth: '100%', overflowX: 'auto' }}>
          <Box>
            {page === "entry" && <TripEntryForm trucks={trucks} addTrip={addTrip} trips={trips} />}
            {page === "alltrips" && <AllTrips trips={trips} />}
            {page === "trucks" && <TruckManager trucks={trucks} setTrucks={setTrucks} />}
            {page === "profit" && <TripTable trips={trips} trucks={trucks} clearTrips={clearTrips} />}
            {page === "reports" && <Reports trips={trips} clearTrips={clearTrips} />}
            {page === "driverreports" && <DriverReports trips={trips} />}
          </Box>
        </Paper>
      </Container>
      <Box sx={{ textAlign: 'center', color: 'grey.600', pb: 2, fontSize: 13 }}>
        © {new Date().getFullYear()} Advait Road Movers. All rights reserved.
      </Box>
    </ThemeProvider>
  );
}

export default App; 