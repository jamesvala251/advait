import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PREDEFINED_USERNAME = 'admin';
const PREDEFINED_PASSWORD = 'admin@321';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === PREDEFINED_USERNAME && password === PREDEFINED_PASSWORD) {
      localStorage.setItem('isLoggedIn', 'true');
      setError('');
      if (onLogin) onLogin();
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <Paper elevation={4} sx={{ p: 4, minWidth: 320 }}>
        <Box 
          component="img" 
          src="/logo.jpg" 
          alt="Logo" 
          sx={{ 
            display: 'block', 
            margin: '0 auto 24px', 
            maxWidth: 120,
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        />
        <Typography variant="h5" gutterBottom align="center">Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
            autoComplete="username"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            autoComplete="current-password"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
        <Button 
          variant="text" 
          color="primary" 
          fullWidth 
          sx={{ mt: 2 }} 
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Paper>
    </Box>
  );
} 