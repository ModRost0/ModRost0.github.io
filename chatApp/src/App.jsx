import React, { useEffect, useState, useRef, useContext } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { UserContext } from './context/UserContext';
import dayjs from 'dayjs';
import './App.css';

function App() {
  const [form, setForm] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const ws = useRef(null);
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { user } = useContext(UserContext);

  // Fetch messages initially
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('https://chat-server-plum.vercel.app/api/chat', {
          method: 'GET',
          credentials: 'include', // Ensure session cookie is sent
        });
        if (response.ok) {
          const data = await response.json();
          setAllMessages(data.reverse());
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, []);

  // Connect WebSocket and handle messages
  const connectWebSocket = () => {
    if (ws.current) ws.current.close(); // Close existing WebSocket before creating a new one
    ws.current = new WebSocket('wss://chat-server-plum.vercel.app/');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      handleWebSocketMessage(event);
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected', event.reason || 'No reason provided');
      retryConnection();
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  // Handle new WebSocket message
  const handleWebSocketMessage = (event) => {
    try {
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            const newMessage = JSON.parse(reader.result);
            setAllMessages((prev) => [...prev, newMessage]);
          } catch (error) {
            console.error('Error parsing Blob data:', error);
          }
        };
        reader.readAsText(event.data);
      } else if (typeof event.data === 'string') {
        const newMessage = JSON.parse(event.data);
        setAllMessages((prev) => [...prev, newMessage]);
      } else {
        console.warn('Received unexpected data type:', event.data);
      }
    } catch (error) {
      console.error('WebSocket message error:', error, event.data);
    }
  };

  // Retry WebSocket connection
  const retryConnection = () => {
    const retryDelay = 5000;
    console.log(`Retrying WebSocket connection in ${retryDelay / 1000} seconds...`);
    setTimeout(connectWebSocket, retryDelay);
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  // Handle scroll to load older messages
  const handleScroll = async () => {
    const container = messagesContainerRef.current;
    if (container.scrollTop === 0 && !loadingOlderMessages) {
      setLoadingOlderMessages(true);
      try {
        const skip = allMessages.length;
        const limit = 20;
        const response = await fetch(`https://chat-server-plum.vercel.app/api/chat/older?skip=${skip}&limit=${limit}`, {
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
    }
  };

  // Handle message input changes
  const handleChange = (e) => {
    setForm(e.target.value);
    setErrorMessage('');
  };

  // Send message to the server and WebSocket
  const handleSend = async () => {
    if (!form.trim()) {
      setErrorMessage('Message cannot be empty');
      return;
    }

    const messageData = {
      message: form,
      sender: user ? user.username : 'Anonymous',
      timestamp: new Date().toISOString(),
    };

    setIsSending(true);

    try {
      // Send via WebSocket
      ws.current.send(JSON.stringify(messageData));

      // Also send via HTTP (to store in DB)
      await fetch('https://chat-server-plum.vercel.app/api/chat', {
        method: 'POST',
        credentials: 'include', // Include session cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      setForm('');
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsSending(false);
    }
  };

  return (
    <Box display="flex" height="100vh" bgcolor="transparent">
      <Box display="flex" flexDirection="column" flexGrow={1}>
        <Box
          ref={messagesContainerRef}
          flexGrow={1}
          overflow="auto"
          onScroll={handleScroll}
          sx={{ padding: 2, backgroundColor: 'rgba(54, 57, 63, 0.7)', backdropFilter: 'blur(10px)' }}
        >
          {allMessages.map((msg, index) => (
            <Box key={index} marginBottom={2}>
              <Typography variant="body1" ref={messageEndRef}>
                <strong>{msg.sender}</strong>: {msg.message}
              </Typography>
              <Typography variant="caption" color="gray">
                {dayjs(msg.timestamp).format('HH:mm')}
              </Typography>
            </Box>
          ))}
          {loadingOlderMessages && (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress size={24} />
            </Box>
          )}
          <div ref={messageEndRef}></div>
        </Box>

        <Box sx={{ padding: 2, backgroundColor: 'rgba(54, 57, 63, 0.5)', backdropFilter: 'blur(10px)' }}>
          <TextField
            fullWidth
            variant="outlined"
            value={form}
            onChange={handleChange}
            placeholder="Type your message..."
            label="Message"
            sx={{ input: { color: '#ffffff' }, backgroundColor: 'rgba(44, 47, 51, 0.5)', marginRight: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={isSending}
            sx={{ backgroundColor: '#5865f2', '&:hover': { backgroundColor: '#4752c4' } }}
          >
            Send
          </Button>
        </Box>

        {errorMessage && (
          <Box sx={{ padding: 2, backgroundColor: '#f44336', color: '#ffffff', borderRadius: 1 }}>
            <Typography variant="body2">{errorMessage}</Typography>
          </Box>
        )}
      </Box>
      <div></div>
    </Box>
  );
}

export default App;
