/*
    This file is the entry point for the server. It initializes the server, sets up the routes, and starts the server.
    Think of it as the main program for the backend.
*/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Gain Access to Routes; Remeber to define the apiURL
// Also initializes connection to MongoDB + Firebase Admin
routes(app);
const apiUrl = process.env.API_BASE_URL; 

/* Testing Firebase authentication & MongoDB Route Usage (Can be Safetly Omitted) */
const test = async () => {
    // Variables + Imports for test
    const { signInWithEmailAndPassword } = require('firebase/auth');
    const { auth } = require('./my-firebase-auth');
    const { createFirebaseUser } = require("./createUser")

    // Main Test Function
    const testFirebaseAuth = async () => {
        // Sample Data
        const email = 'reigen@one.net';
        const password = 'password-lol';

        // Add a new user to Firebase (should have error handling). MUST RUN if the user is not already registered in Firebase!
        //createFirebaseUser(email, password)

        try {
        // Testing Firebase Auth; Makes sure email & password are already registered in Firebase! You'll get back a token if so!
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = await user.getIdToken();
        console.log('---| User successfully signed in:', user.email);

        // Testing Queries using routes stored in 'routes.js' : Acessing Mongo Database
        // Welcome Message
        const response = await fetch(`${apiUrl}/dashboard`, {
            method: 'GET',
            headers: {
            'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            }
        });
        /*
        // Add a new user to MongoDB (should have error handling)
        const response = await fetch(`${apiUrl}/users`, {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        })
            */

        // Verify a Query sent to MongoDB (swap our 'response' with 'response2' to test the other route)
        if (!response.ok) {
            console.error('Failed to access dashboard:', response.statusText);
        } else {
            const data = await response.json();
            console.log('\nPayload:', data);
        }
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log('---| Error during signInWithEmailAndPassword:', errorCode, errorMessage);
        }
    };
        // Call the async function to test Firebase Auth
        testFirebaseAuth();
}
test(); // Run Test Function
/* End of Test ----------------------------------------- */

  
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));