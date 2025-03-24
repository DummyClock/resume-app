const { signInWithEmailAndPassword } = require('firebase/auth');
const { auth } = require('./services/my-firebase-auth');
const { createFirebaseUser } = require("./services/createUser");
const fetch = require('node-fetch'); // Import fetch function
const cookieParser = require('cookie-parser'); // Import cookie-parser
const express = require('express');
const app = express();

// Define apiUrl
const apiUrl = process.env.API_BASE_URL;

// Use cookie-parser middleware
app.use(cookieParser());

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

        app.use((req, res, next) => {
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                maxAge: 60 * 60 * 1000, // 1 hour
                sameSite: 'strict'
            });
            next();
        });

        // Log the cookie (from the client request)
        app.use((req, res, next) => {
            console.log('---| Cookie data from the client request:', req.cookies);
            next();
        });

        // Testing Queries using routes stored in 'routes.js' : Accessing Mongo Database
        // Welcome Message
        const response = await fetch(`${apiUrl}/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            }
        });

        /*
        // Create new user
        const response2 = await fetch(`${apiUrl}/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
                'Content-Type': 'application/json' // Indicate that the request body is in JSON format
            },
            body: JSON.stringify({ email: 'newuser@example.com', password: 'newpassword' }) // Request body with email and password
        });
        */

        // Verify a Query sent to MongoDB (swap our 'response' with 'response2' to test the other route)
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to create user:', errorData.message);
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

// Export the test function
module.exports = testFirebaseAuth;