/*
    This file is the entry point for the server. It initializes the server, sets up the routes, and starts the server.
    Think of it as the main program for the backend.
*/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');
const connectDB = require('./config/db');
const admin = require('./config/firebaseAdmin');

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Gain Access to Routes;
// Also initializes connection to MongoDB + Firebase Admin
connectDB();
routes(app);

// Testing Firebase authentication & MongoDB Route Usage (Can be Safetly Omitted)
const testFirebaseAuth = require('./test_route_calls');
testFirebaseAuth();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));