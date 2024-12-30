import React, { useContext } from 'react';
import { Container, Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import WelcomePage from './components/WelcomePage';
import Login from './auth/Login.jsx';
import Register from './auth/Register';
import App from './App';
import ProtectedRoute from './components/ProtectedRoute';
import './AppWrapper.css';
import { UserContext } from './context/UserContext.jsx';

const AppWrapper = () => {
  let {user} = useContext(UserContext)
  return (
    <div className="app-wrapper">
      {/* Video Background */}
      <video autoPlay={true} loop className="background-video">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <NavBar />
      <Container maxWidth="lg" sx={{ paddingTop: 4, paddingBottom: 4 }}>
        <Box sx={{ paddingTop: 4, paddingBottom: 4, textAlign: 'center' }}>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            } />
            {/* Add more protected routes here if necessary */}
          </Routes>
        </Box>
      </Container>
    </div>
  );
}

export default AppWrapper;