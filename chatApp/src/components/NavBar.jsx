import React, { useState ,useContext, useEffect} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { UserContext } from '../context/UserContext';
const Navbar = () => {
  let user = useContext(UserContext);
  const checkAuth = async () => {
      const response = await fetch('http://localhost:3000/api/auth/validate-session', {
        method: 'GET',
        credentials: 'include', // Ensures cookies are sent with the request
      });

      if (response.ok) {
        user = await response.json();
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
  
  };

  if (!user) {
    checkAuth(); // Validate the session if user is not already set
  } 
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* App Title */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Chat App
          </Typography>

          {/* Navigation Links */}
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          {!user ? (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/home">
                Chat
              </Button>
              <Button color="inherit" onClick={()=>alert('Too lazy to implement this')}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
