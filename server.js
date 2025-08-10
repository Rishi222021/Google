import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const app = express();

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Home Route
app.get('/', (req, res) => {
    res.send(`<h1>Home</h1>
              <a href="/auth/google">Login With Google</a>`);
});

// Auth Route
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Auth Callback
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/',
        successRedirect: '/profile'
    })
);

// Profile Route (protected)
app.get('/profile', (req, res) => {
    if (!req.user) {
        return res.redirect('/');
    }
    res.send(`<h1>Hello ${req.user.displayName}</h1>
              <a href="/logout">Logout</a>`);
});

// ✅ Logout Route
app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.redirect('/');
        });
    });
});

// Start server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});