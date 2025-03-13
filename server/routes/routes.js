/*
    Before including routes, make sure to import necessary Schemas
    Remember to user the verifyToken middleware to protect routes
    For Admin routes, check if req.user.admin is true
*/
const { verifyToken } = require('../config/server_init.js');
const User = require('../schemas/user.js');

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

    // POST a new user in MongoDB
    app.post('/users', verifyToken, async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = new User({ email, password });
            await user.save();
            res.json(user);
        } 
        catch (err) {
            res.status(500).json({ message: err.message });
            console.log("Failed to create new user: ", err.message)
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