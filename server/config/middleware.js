/*
    Middleware is also defined to verify Firebase tokens.
    This file should be imported in server.js to use the verifyToken middleware.
*/
require('dotenv').config();
const admin = require('firebase-admin');

// Middleware to Verify Firebase Token
const verifyToken = async (req, res, next) => {
  console.log("--------Verifying token--------");

  let token = req.cookies.token;

  // If no token in cookies, fall back to the Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized, no token provided' });
  }

  try {
    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach the decoded user info to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid Token' });
  }
};

module.exports = { verifyToken };
