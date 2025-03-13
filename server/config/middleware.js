/*
    Middleware is also defined to verify Firebase tokens.
    This file should be imported in server.js to use the verifyToken middleware.
*/
require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path'); 

// Middleware to Verify Firebase Token
const verifyToken = async (req, res, next) => {
  console.log("--------Verifying token--------")
  
  const token = req.headers.authorization;
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token.split(" ")[1]);
    req.user = decodedToken;
    next();
  } 
  catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid Token' });
  }
};

module.exports = { verifyToken };