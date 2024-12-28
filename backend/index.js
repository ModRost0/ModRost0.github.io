if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const mongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const { WebSocketServer } = require('ws');
const WebSocket = require('ws');
const http = require('http');
const cookieParser = require('cookie-parser');
const User = require('./model/user');
const Message = require('./model/message');
const userRouter = require('./routes/user');

const app = express();
const port = process.env.PORT || 3000;
const dbUrl = process.env.MONGODB_URL;

// Database Connection
mongoose.connect(dbUrl, { ssl: true })
  .then(() => console.log('Connected to database'))
  .catch((err) => console.error('Database connection error:', err));

// Session Configuration
const store = mongoStore.create({
  mongoUrl: dbUrl,
  ttl: 14 * 24 * 60 * 60,
  touchAfter: 24 * 60 * 60,
  crypto: { secret: process.env.SESSION_SECRET },
});

const sessionConfig = {
  store,
  name: 'session-real',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 14 * 24 * 60 * 60 * 1000,
  },
};

// Middleware Setup
const cors = require('cors');
app.use(cors({
  origin: 'https://chat-client-hazel.vercel.app',  // Allow only your frontend URL
  credentials: true  // Allow credentials (cookies, session)
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to Add User Info to Response Locals
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.title = req.body.name || "AppsWhat";
  next();
});

// Authentication Middleware
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ loggedIn: false, message: 'Unauthorized' });
};

// API Routes
app.use('/api', userRouter);

app.get('/api/chat', isLoggedIn, async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 }).limit(20);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/chat', isLoggedIn, async (req, res) => {
  try {
    const newMessage = await Message.create(req.body);
    res.json({ success: true, message: newMessage });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

app.get('/api/auth/validate-session', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ success: true, user: req.user });
  } else {
    res.json({ success: false });
  }
});

app.get('/api/chat/older', isLoggedIn, async (req, res) => {
  const { skip, limit } = req.query;
  try {
    const messages = await Message.find({})
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    res.json(messages);
  } catch (err) {
    console.error('Error fetching older messages:', err);
    res.status(500).json({ error: 'Failed to fetch older messages' });
  }
});

// WebSocket Server Setup with CORS Handling
const server = http.createServer(app);
const ws = new WebSocketServer({ 
  server, 
  verifyClient: (info, done) => {
    const origin = info.origin;  // The origin of the incoming WebSocket connection
    if (origin === 'https://chat-client-hazel.vercel.app') {
      done(true);  // Accept the connection if the origin matches
    } else {
      console.log('Blocked WebSocket connection from:', origin);
      done(false, 403, 'Forbidden');  // Reject the connection if the origin doesn't match
    }
  }
});

// WebSocket Message Handling
ws.on('connection', (ws) => {
  console.log('New WebSocket connection established');

  ws.on('message', (message) => {
    console.log('Received message:', message);
    // Broadcast the message to all connected clients
    ws.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => console.log('WebSocket connection closed'));
  ws.on('error', (error) => console.error('WebSocket error:', error));
});

// Start Server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
