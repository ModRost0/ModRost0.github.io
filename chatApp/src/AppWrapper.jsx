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
import VideoComponent from './VideoComponent'
const AppWrapper = () => {
  let {user} = useContext(UserContext)
  return (
    <div className="app-wrapper">
      {/* Video Background */}
      <VideoComponent />
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
