import React, { useEffect, useState, useRef, useContext } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Drawer, AppBar, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { UserContext } from './context/UserContext';
import dayjs from 'dayjs';
import './App.css';

function App() {
  const [form, setForm] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useContext(UserContext);
  const ws = useRef(null);
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('https://modrost0-github-io.onrender.com/api/chat', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setAllMessages((prev) => [...data.reverse(), ...prev]);
        }
      } catch (error) {
        console.error('Error fetching older messages:', error);
      } finally {
        setLoadingOlderMessages(false);
      }
    };

    fetchMessages();
    connectWebSocket();

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    if (ws.current) ws.current.close();
    ws.current = new WebSocket('wss://modrost0-github-io.onrender.com');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = async (event) => {
      try {
        const data = await event.data.text();
        const newMessage = JSON.parse(data);
        setAllMessages((prev) => [...prev, newMessage]);
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(connectWebSocket, 5000); // Retry after 5 seconds
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const response = await fetch('https://modrost0-github-io.onrender.com/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: form }),
      });
      const data = await response.json();
      if (response.ok) {
        setForm('');
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setErrorMessage(data.error);
      }
    } catch (error) {
      setErrorMessage('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Chat App
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {/* Drawer content */}
      </Drawer>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }} ref={messagesContainerRef}>
        {loadingOlderMessages && <CircularProgress />}
        <ul>
          {allMessages.map((message, index) => (
            <li key={index}>{message.content}</li>
          ))}
        </ul>
        <div ref={messageEndRef} />
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', p: 2 }}>
        <TextField
          value={form}
          onChange={(e) => setForm(e.target.value)}
          fullWidth
          placeholder="Type a message"
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary" disabled={isSending}>
          {isSending ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </Box>
      {errorMessage && (
        <Box sx={{ padding: 2, backgroundColor: '#f44336', color: '#ffffff', borderRadius: 1 }}>
          <Typography variant="body2">{errorMessage}</Typography>
        </Box>
      )}
    </Box>
  );
}

export default App;
