import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext.jsx'; // Ensure you have a UserContext for global user state

const ProtectedRoute = ({ children }) => {
  const { user, setUser, isLoading, setIsLoading } = useContext(UserContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
    const environment = import.meta.env.MODE === 'production' ? 'https://modrost0-github-io.onrender.com/api/auth/validate-session' : 'http://localhost:3000/api/auth/validate-session';
  

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(environment, {
          method: 'GET',
          credentials: 'include', // Ensures cookies are sent with the request
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // Update user state
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error validating session:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (!user) {
      checkAuth(); // Validate the session if user is not already set
    } else {
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Replace with a loading spinner or placeholder
  }
  return children;
};

export default ProtectedRoute;
