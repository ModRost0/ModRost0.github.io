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
    .post(async(req, res) => {
        try {
            const user = new User({ username: req.body.username });
            await User.register(user, req.body.password);
            res.status(201).json({ success: true, user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

router.route('/login')
<<<<<<< HEAD
  .post((req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }
        // Log Set-Cookie header  
        // Send a response to frontend
        res.json({
          success: true,
          user
        });
      });
    })(req, res, next);
  });
=======
    .post((req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            console.log('login', user);
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            req.logIn(user, (err) => {
                console.log("LOGIN SUCESSFUL, SESSION:", req.session);
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                console.log('Session after login:', req.session);
                res.json({ success: true, user });
            });

        })(req, res, next);
    });
>>>>>>> 1d77d5fe13bffebfe6fdcfbb090a529a5091c0d9

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