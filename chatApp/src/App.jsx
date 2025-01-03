import React, { useEffect, useState, useRef, useContext } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Drawer, AppBar, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { UserContext } from './context/UserContext';
import './App.css';

function App() {
  const [form, setForm] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, setUser, baseUrl } = useContext(UserContext);
  const ws = useRef(null);
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const environment = import.meta.env.MODE === 'production' ? 'https://modrost0-github-io.onrender.com/api/auth/validate-session' : 'http://localhost:3000/api/auth/validate-session';
  useEffect(() => {
    const environment = import.meta.env.MODE === 'production' ? 'https://modrost0-github-io.onrender.com/api/chat' : 'http://localhost:3000/api/chat';
    const fetchMessages = async () => {
      try {
        const response = await fetch(environment, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setAllMessages(data.reverse());
          console.log('Fetched messages:', data);
        } else {
          console.error('Failed to fetch messages:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
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
  }, [baseUrl]);

  useEffect(() => {
    // Scroll to the bottom whenever allMessages changes
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const connectWebSocket = () => {
    if (ws.current) ws.current.close();
    ws.current = new WebSocket(`wss://modrost0-github-io.onrender.com`);
    console.log('WebSocket connecting...');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = async (event) => {
      try {
        const data = await event.data.text();
        const newMessage = JSON.parse(data);
        setAllMessages((prev) => [...prev, newMessage]);
        console.log('Received WebSocket message:', newMessage);
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
      let message = { sender: user ? user.username : 'anonymous', message: form };
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      const data = await response.json();
      if (response.ok) {
        setForm('');
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(message));
        }
        console.log('Message sent:', data);
      } else {
        setErrorMessage(data.error);
        console.error('Failed to send message:', data.error);
      }
    } catch (error) {
      setErrorMessage('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' ,overflowY:'auto'}}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2,zIndex:1 }} ref={messagesContainerRef}>
        {loadingOlderMessages && <CircularProgress />}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {allMessages.map((message, index) => (
            <Box key={index} className="message">
              <Typography variant="body1" className="message-sender">
                {message.sender}:
              </Typography>
              <Typography variant="body2" className="message-content">
                {message.message}
              </Typography>
            </Box>
          ))}
          <div ref={messageEndRef} />
        </Box>
      </Box>
  <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', p: 2 }}>
   <TextField
    value={form}
    onChange={(e) => setForm(e.target.value)}
    fullWidth
    placeholder="Type a message"
    variant="outlined"
    sx={{
      '& .MuiOutlinedInput-root': {
        '& input': {
          color: '#7289da', // Sets the text color inside the input
        },
      },
    }}
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
