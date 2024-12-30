import React, { useState,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
import { UserContext } from '../context/UserContext';
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
 const {setUser} = useContext(UserContext);
 const handleLogin = async (e) => {
  e.preventDefault();
  if (!username || !password) {
    setErrorMessage('Username and password are required');
    return;
  } // Start loading indicator
  try {
    const response = await fetch('https://modrost0-github-io.onrender.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Login successful:', data);
      setUser(data.user);
      navigate('/home');
    } else {
      console.error('Login failed:', data);
      setErrorMessage(data.message || 'Login failed. Please try again.');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    setErrorMessage('Unable to connect to the server. Please try again later.');
  } finally { // Stop loading indicator
  }
};

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <Box component="form" onSubmit={handleLogin} sx={{ width: '300px' }}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login
        </Button>
        {errorMessage && (
          <Typography color="error" align="center" sx={{ marginTop: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Login;
