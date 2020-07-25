// Modules needed.
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const config = require('./config');

// Use, serialize and deserialize Users.
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Function to genetare Token, which will run for a week.
exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 604800
    });
};

// Options for JWT Strategy.
var opts = {};

// Get Token from Authorization Header
// of Incoming Request as Bearer Token.
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

// Secret key from config.js.
opts.secretOrKey = config.secretKey;

// JWT Strategy.
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payoad, done) => {
        User.findOne({
            _id: jwt_payoad._id
        }, (err, user) => {
            if (err) {
                return done(err, false);
            } else if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
    }));

// Verify User Middleware for Check Access to some endpoints.
exports.verifyUser = passport.authenticate('jwt', {
    session: false
});

// Middleware to check if User is an Admin.
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        next();
    } else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};