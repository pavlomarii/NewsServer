// Modules needed.
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const passport = require('passport');
const authenticate = require('../authenticate');
const User = require('../models/user');

// JSON-parsing.
router.use(bodyParser.json());

// GET Users Listing.
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find({})
        .then((users) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        }, (err) => next(err))
        .catch((err) => next(err));
});

// Route for Register new Users.
router.post('/signup', (req, res, next) => {

    // Register User.
    User.register(new User({
        username: req.body.username
    }), req.body.password, (err, user) => {

        // Error Handler.
        if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({
                err: err
            });
        }

        // Successful registration
        else {
            if (req.body.firstname) {
                user.firstname = req.body.firstname;
            }
            if (req.body.lastname) {
                user.lastname = req.body.lastname;
            }
            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({
                        err: err
                    });
                    return;
                }
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({
                        success: true,
                        status: 'Registration Successful!'
                    })
                });
            });
        }
    });
});

// Route for Login Users using Local Passport.
router.post('/login', passport.authenticate('local'), (req, res) => {

    // Creating token for Users.
    var token = authenticate.getToken({
        _id: req.user._id
    });

    // Response with the token.
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
        success: true,
        token: token,
        status: 'You are successfully logged in!'
    });
});

// Route for Logout Users.
// Це залишилось від сесій. Можливо, непотрібне при токен авторизації.
router.get('/logout', (req, res, next) => {

    // Clear all info about session, logout and redirect to main route.
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    }

    // Error for user which is not logined yet.
    else {
        var err = new Error('You are not logged in!');
        err.status = 403;
        next(err);
    }
});

// Export this router to app.js.
module.exports = router;