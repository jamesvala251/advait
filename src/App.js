import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams, useNavigate } from "react-router-dom";
import { truckService, tripService, expenseService } from "./services/api";
import TruckManager from "./components/TruckManager";
import TripEntryForm from "./components/TripEntryForm";
import TripTable from "./components/TripTable";
import Reports from "./components/Reports";
import AllTrips from "./components/AllTrips";
import DriverReports from "./components/DriverReports";
import DriverManagement from "./components/DriverManagement";
import TruckExpenses from "./components/TruckExpenses";
import ProfitLoss from "./components/ProfitLoss";
import LoadDetails from "./components/LoadDetails";
import Login from "./components/Login";
import LandingPage from "./components/LandingPage";
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
  IconButton,
  Alert,
  CircularProgress,
  Button
} from "@mui/material";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';

const TRUCKS_KEY = "trucks_data";
const TRIPS_KEY = "trips_data";
const EXPENSES_KEY = "expenses_data";

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
  { label: "Entry", icon: <AssignmentIcon />, value: "entry" },
  { label: "Trips", icon: <TableChartIcon />, value: "alltrips" },
  { label: "Trucks", icon: <DirectionsCarIcon />, value: "trucks" },
  { label: "Expense", icon: <ReceiptIcon />, value: "expenses" },
  { label: "Market", icon: <AssignmentIcon />, value: "loads" },
  { label: "Profit/Loss", icon: <TableChartIcon />, value: "profit" },
  { label: "Report", icon: <PersonIcon />, value: "driverreports" },
  { label: "Drivers", icon: <ManageAccountsIcon />, value: "drivermanagement" },
];

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const Dashboard = ({ page, setPage, error, loading, trucks, trips, expenses, addTrip, handleTripDelete, setTrips, setTrucks }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle page change with URL update
  const handlePageChange = (newPage) => {
    setPage(newPage);
    navigate(`/dashboard/${newPage}`);
  };

  return (
    <>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            Advait Road Movers
          </Typography>
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                edge="end"
                onClick={() => setDrawerOpen(true)}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
              >
                <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
                  <List>
                    {NAV.map((nav) => (
                      <ListItem key={nav.value} disablePadding>
                        <ListItemButton selected={page === nav.value} onClick={() => handlePageChange(nav.value)}>
                          <ListItemIcon>{nav.icon}</ListItemIcon>
                          <ListItemText primary={nav.label} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => {
                        localStorage.removeItem('isLoggedIn');
                        window.location.reload();
                      }}>
                        <ListItemText primary="Logout" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            <>
              <Tabs
                value={page}
                onChange={(_, v) => handlePageChange(v)}
                textColor="inherit"
                indicatorColor="secondary"
                orientation="horizontal"
                variant="standard"
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
              <Button color="inherit" onClick={() => {
                localStorage.removeItem('isLoggedIn');
                window.location.reload();
              }}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 0, sm: 2 } }}>
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
          <Paper elevation={3} sx={{ p: { xs: 1, sm: 3 }, mt: 4, maxWidth: '100%', overflowX: 'auto' }}>
            <Box>
              {page === "entry" && <TripEntryForm trucks={trucks} addTrip={addTrip} trips={trips} />}
              {page === "alltrips" && <AllTrips trips={trips} trucks={trucks} onTripDelete={handleTripDelete} setTrips={setTrips} />}
              {page === "trucks" && <TruckManager trucks={trucks} setTrucks={setTrucks} />}
              {page === "expenses" && <TruckExpenses trucks={trucks} expenses={expenses} />}
              {page === "loads" && <LoadDetails />}
              {page === "profit" && <ProfitLoss trips={trips} expenses={expenses} />}
              {page === "driverreports" && <DriverReports trips={trips} />}
              {page === "drivermanagement" && <DriverManagement />}
            </Box>
          </Paper>
        )}
      </Container>
    </>
  );
};

// AppContent component that uses Router hooks
function AppContent() {
  const [trucks, setTrucks] = useState([]);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState("entry");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const location = useLocation();

  // Update page state based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard/')) {
      const pageFromPath = path.split('/dashboard/')[1];
      if (pageFromPath && pageFromPath !== page) {
        setPage(pageFromPath);
      }
    } else if (path === '/dashboard') {
      setPage('entry');
    }
  }, [location.pathname, page]);

  // Set initial page based on URL on first load
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') {
      setPage('entry');
    } else if (path.includes('/dashboard/')) {
      const pageFromPath = path.split('/dashboard/')[1];
      setPage(pageFromPath || 'entry');
    }
  }, []); // Run only on mount

  // Function to fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [trucksResponse, tripsResponse, expensesResponse] = await Promise.all([
        truckService.getAll().catch(err => ({ data: { data: [] } })),
        tripService.getAll().catch(err => ({ data: { data: [] } })),
        expenseService.getAll().catch(err => ({ data: { data: [] } }))
      ]);
      
      setTrucks(trucksResponse.data?.data || []);
      setTrips(tripsResponse.data?.data || []);
      setExpenses(expensesResponse.data?.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to connect to the server. Please make sure the backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  // Load data from API on component mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  // Function to handle truck updates
  const handleTruckUpdate = async () => {
    try {
      const response = await truckService.getAll();
      setTrucks(response.data?.data || []);
    } catch (err) {
      setError('Failed to update trucks. Please try again.');
      console.error('Error updating trucks:', err);
    }
  };

  const addTrip = async (trip) => {
    try {
      const response = await tripService.create(trip);
      setTrips([...trips, response.data]);
    } catch (err) {
      let errorMsg = 'Failed to add trip.';
      if (err.response?.data?.message) {
        errorMsg += ' ' + err.response.data.message;
      }
      if (err.response?.data?.errors) {
        errorMsg += ' ' + JSON.stringify(err.response.data.errors);
      }
      setError(errorMsg);
      console.error('Error adding trip:', err.response?.data || err.message || err);
    }
  };

  const clearTrips = async () => {
    try {
      await Promise.all(trips.map(trip => tripService.delete(trip.id)));
      setTrips([]);
    } catch (err) {
      setError('Failed to clear trips. Please try again.');
      console.error('Error clearing trips:', err);
    }
  };

  const handleLogin = () => setIsLoggedIn(true);

  const handleTripDelete = async (tripId) => {
    try {
      setTrips(trips.filter(trip => trip.id !== tripId));
    } catch (err) {
      setError('Failed to delete trip. Please try again.');
      console.error('Error deleting trip:', err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/entry" replace />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard
                page={page}
                setPage={setPage}
                error={error}
                loading={loading}
                trucks={trucks}
                trips={trips}
                expenses={expenses}
                addTrip={addTrip}
                handleTripDelete={handleTripDelete}
                setTrips={setTrips}
                setTrucks={setTrucks}
              />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}

// Main App component that provides Router context
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App; 