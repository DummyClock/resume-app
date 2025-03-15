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
const cookieParser = require('cookie-parser');

// Initialize Express
const app = express();
app.use(express.json());
app.use(cookieParser())

const corsOptions = {
    origin: 'http://localhost:3000/', // Replace with your actual front-end URL (e.g., http://localhost:3000 for local dev)
    credentials: true, // Allow cookies (such as the token cookie) to be sent with the request
  };
app.use(cors(corsOptions));

// Gain Access to Routes;
// Also initializes connection to MongoDB + Firebase Admin
connectDB();
routes(app);

// Testing Firebase authentication & MongoDB Route Usage (Can be Safetly Omitted)
//const testFirebaseAuth = require('./test_route_calls');
//testFirebaseAuth();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));