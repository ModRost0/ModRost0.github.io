const express = require('express');
const passport = require('passport');
const User = require('../model/user');
const router = express.Router();

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ loggedIn: false, message: 'Unauthorized' });
  }
};

router.route('/register')
  .post(async (req, res) => {
    try {
      const user = new User({ username: req.body.username });
      await User.register(user, req.body.password);
      res.status(201).json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  router.route('/login')
  .post((req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Log in the user manually
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }

        // Set a cookie to store session or token info
        res.cookie('sessionID', req.sessionID, {
          httpOnly: true, // Make the cookie HTTP only for security
          secure: true, // Ensure cookies are only sent over HTTPS
          sameSite: 'None', // Cross-origin cookies if needed
          maxAge: 1209600000, // Cookie expiration (e.g., 14 days)
        });

        // Send a response to frontend
        res.json({
          success: true,
          message: 'Logged in successfully',
          user: {
            username: user.username,
            id: user._id,
          },
        });
      });
    })(req, res, next);
  });

router.post('/logout', isLoggedIn, (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Successfully Logged Out');
    res.json({ success: true, redirectUrl: '/home' });
  });
});

module.exports = router;