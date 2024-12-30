import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.username || !formData.password) {
      setErrorMessage('Username and password are required');
      return;
    }
  
; // Start loading
    try {
      const response = await fetch('https://modrost0-github-io.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
  
      if (data.success) {
        navigate('/home');
      } else {
        setErrorMessage(data.message || 'Failed to register. Please try again.');
      }
    } catch (error) {
      setErrorMessage('An error occurred during registration.');
      console.error('Error:', error);
    } 
  };
  
  return (
    <Box className="register-container" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Register
      </Typography>
      <form onSubmit={handleSubmit} className="register-form">
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="register-input"
        />
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="register-input"
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="register-input"
        />
        {errorMessage && (
          <Typography color="error" align="center" className="error-message">
            {errorMessage}
          </Typography>
        )}
        <Button variant="contained" color="primary" fullWidth type="submit" className="register-button" sx={{ mt: 2 }}>
          Register
        </Button>
      </form>
    </Box>
  );
}

export default Register;