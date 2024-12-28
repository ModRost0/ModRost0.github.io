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
    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.success) {
        navigate('/home');
      } else {
        setErrorMessage(data.message);
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