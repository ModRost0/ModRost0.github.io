import React from 'react';
import { createRoot } from 'react-dom/client';
import AppWrapper from './AppWrapper'; 
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext.jsx';
import './components/WelcomePage.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
