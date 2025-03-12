require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const pathToServiceAccount = './----------------------------------------------REPLACE WITH FIREBASE SDK FILE PATH---------------------';

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Initialize Firebase Admin
const serviceAccount = require(pathToServiceAccount);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Create a simple User schema
const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
});
const User = mongoose.model('User', UserSchema);

// Middleware to Verify Firebase Token
const verifyToken = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// Routes

// Public route (no auth required)
app.get('/', (req, res) => {
  res.send('Welcome to the backend!');
});

// Protected route (requires authentication)
app.get('/dashboard', verifyToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}` });
});

// Create a new user in MongoDB
app.post('/users', verifyToken, async (req, res) => {
  const { email, name } = req.body;
  try {
    const user = new User({ email, name });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (admin only)
app.get('/users', verifyToken, async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ message: 'Forbidden' });
  const users = await User.find();
  res.json(users);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
