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
                res.cookie('connect.sid', req.sessionID, { httpOnly: true ,secure:true, sameSite:'none'});
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                console.log('Session after login:', req.session);
                res.json({ success: true, user });
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