import React, { useContext, useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { UserContext } from '../context/UserContext';
function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
let {setUser} = useContext(UserContext);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.user)
        navigate('/home');
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('An error occurred during login.');
      console.error('Error:', error);
    }
  };

  return (
    <Box className="login-container" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit} className="login-form">
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="login-input"
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="login-input"
        />
        {errorMessage && (
          <Typography color="error" align="center" className="error-message">
            {errorMessage}
          </Typography>
        )}
        <Button variant="contained" color="primary" fullWidth type="submit" className="login-button" sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
    </Box>
  );
}

export default Login;
