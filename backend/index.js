if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const mongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const { WebSocketServer } = require("ws");
const http = require("http");
const cookieParser = require("cookie-parser");
const User = require("./model/user");
const Message = require("./model/message");
const userRouter = require("./routes/user");

const app = express();
const port = process.env.PORT || 3000;
const dbUrl = process.env.MONGODB_URL;

// Database Connection
mongoose
  .connect(dbUrl, { ssl: true })
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Database connection error:", err));

// Session Configuration
const store = mongoStore.create({
  mongoUrl: dbUrl,
  ttl: 14 * 24 * 60 * 60,
  touchAfter: 24 * 60 * 60,
  crypto: { secret: process.env.SESSION_SECRET },
});

const sessionConfig = {
  store,
  name: 'session-real', // Custom session cookie name
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Use secure cookies in production// Prevent client-side access to cookies
    sameSite: 'none', // Required for cross-origin cookies
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
  },
};
app.use(session(sessionConfig));
store.on('create', (sessionId) => {
  console.log('Session created:', sessionId);
});

store.on('update', (sessionId) => {
  console.log('Session updated:', sessionId);
});

// Middleware Setup
const cors = require("cors");
app.use(
  cors({
    origin: ["https://chat-client-hazel.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies and credentials
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user with ID:', id);
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Middleware to Add User Info to Response Locals
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.title = req.body.name || "AppsWhat";
  next();
});

// Authentication Middleware


// Async Error Wrapper
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
const isLoggedIn = (req, res, next) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ loggedIn: false, message: 'Unauthorized' });
  }
};
// API Routes
app.use("/api", userRouter);

app.get(
  "/api/chat",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const messages = await Message.find({}).sort({ date: -1 }).limit(20);
    res.json(messages);
  })
);

app.post(
  "/api/chat",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const newMessage = await Message.create(req.body);
    res.json({ success: true, message: newMessage });
  })
);

app.get("/api/auth/validate-session", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ success: true, user: req.user });
  } else {
    res.json({ success: false });
  }
});

app.get(
  "/api/chat/older",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { skip, limit } = req.query;
    const messages = await Message.find({})
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    res.json(messages);
  })
);

// WebSocket Server Setup with CORS Handling
const server = http.createServer(app);
const wsServer = new WebSocketServer({
  server,
  verifyClient: (info, done) => {
    const origin = info.origin;
    if (["https://chat-client-hazel.vercel.app",'http://localhost:5173'].includes(origin)) {
      done(true);
    } else {
      console.log("Blocked WebSocket connection from:", origin);
      done(false, 403, "Origin not allowed");
    }
  },
});

// WebSocket Message Handling
wsServer.on("connection", (ws) => {
  console.log("New WebSocket connection established");

  ws.on("message", (message) => {
    console.log("Received message:", message);

    // Broadcast the message to all connected clients
    wsServer.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => console.log("WebSocket connection closed"));
  ws.on("error", (error) => console.error("WebSocket error:", error));
});

// Start Server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
