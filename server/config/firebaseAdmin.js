require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path'); 

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const serviceAccount = require(serviceAccountPath); // Ensure this is a correct file path
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

module.exports = admin;