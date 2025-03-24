/*
    Before including routes, make sure to import necessary Schemas
    Remember to user the verifyToken middleware to protect routes
    For Admin routes, check if req.user.admin is true
*/
const { verifyToken } = require('../config/middleware.js');
const User = require('../schemas/user.js');
const { signInWithEmailAndPassword } = require('firebase/auth');
const { auth } = require('../services/my-firebase-auth.js');
const { createUser, createFirebaseUser } = require('../services/createUser.js');

module.exports = (app) => {
/* Public Routes (no auth required)-----*/
    app.get('/', (req, res) => {
        res.send('Welcome to the Lighthouse! IDK, we\'re still working on a name.');
    });

/* Protected Routes (requires authentication)-----*/
    // Welcome Message
    app.get('/dashboard', verifyToken, (req, res) => {
        res.json({ message: `Welcome, ${req.user.email}` });
    });

    // Create a new user in Firebase Auth, then add into MongoDB
    app.post('/users', verifyToken, async (req, res) => {
        const { email, password } = req.body;
        try {
            // Create user in Firebase Auth
            createFirebaseUser(email, password);
            // Create user in MongoDB
            const user = new User({ email, password });
            await user.save();
            res.json({ email: user.email, id: user._id });
        } 
        catch (err) {
            res.status(500).json({ message: err.message });
            console.log("Failed to create new user: ", err.message)
        }
    });

    // Login Route
    app.post("/login", async (req, res) => {
        const { email, password } = req.body;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const token = await user.getIdToken();
            console.log('---| User successfully signed in:');
            res.cookie('token', token, {
                httpOnly: true, // Can't be accessed via JavaScript
                secure: true, 
                maxAge: 5*60 * 60 * 1000, // 5 hour
                sameSite: 'Strict' // Helps mitigate CSRF
            }).json({ message: 'Login successful' });
        } catch (err) {
            if (err.code === 'auth/email-already-exists') {
                res.status(400).json({ message: 'The email address is already in use by another account.' });
            } else {
                res.status(500).json({ message: err.message });
            }
            console.log("Failed to sign in user: ", err.message);
        }
    })

    // Logout Route
    app.post("/logout", (req, res) => {
        res.clearCookie('token').json({ message: 'Logout successful' });
        console.log('---| User successfully logged out');
    });

    // Delete User Route

    // Refresh Token Route
    app.post("/refresh-token", async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        // Verify the refresh token
        const decodedToken = await verifyRefreshToken(refreshToken);
        if (!decodedToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        try {
            const auth = getAuth();
            const user = await auth.verifyIdToken(refreshToken, true);
            const newIdToken = await user.getIdToken();
            res.cookie('token', newIdToken, cookieDefaultOptions).json({ token: newIdToken });
        } catch (err) {
            res.status(500).json({ message: 'Failed to refresh token', error: err.message });
        }
    });

    
/* Admin Routes (requires admin rights)-----*/
    // GET all users (admin only)
    app.get('/users', verifyToken, async (req, res) => {
        if (!req.user.admin) 
            return res.status(403).json({ message: 'Forbidden' });
        const users = await User.find();
        res.json(users);
    });
}