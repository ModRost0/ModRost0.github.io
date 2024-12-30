import React, { useContext } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import './WelcomePage.css';
import { UserContext } from '../context/UserContext.jsx';

function WelcomePage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      {/* Video Background */}
      {/* Main Content */}
      <Box className="content">
        <motion.div
          className="text-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          {!user ? (
            <>
              <Typography variant="h1" gutterBottom className="welcome-title">
                Welcome to Gamer Chat
              </Typography>
              <Typography variant="h4" gutterBottom className="welcome-subtitle">
                Connect with fellow Soulsborne enthusiasts
              </Typography>
              <Typography variant="h6" gutterBottom className="welcome-description">
                Join our community and share your experiences, tips, and strategies.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/login"
                className="action-button"
                sx={{
                  backgroundColor: '#003300',
                  color: '#00ff66',
                  '&:hover': {
                    backgroundColor: '#00cc66',
                  },
                  padding: '10px 20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '5px',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                Get Started
              </Button>
            </>
          ) : (
            <div>
              <Typography variant="h5" gutterBottom className="welcome-subtitle">
              Welcome back, {user.username}!
            </Typography>
            </div>
            
          )}
        </motion.div>
      </Box>
    </div>
  );
}

export default WelcomePage;
