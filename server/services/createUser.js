/*
    Use this script to create a new user in Firebase Authentication. 
    Before running this file, make sure you run server_init.js to intialize the Firebase Admin SDK. (Otherwise, you'll be blocked by Firebase)
*/
require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path'); 

// Create a new user in Firebase Authentication
const createFirebaseUser = async (email, password) => {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    console.log('Successfully created new user:', userRecord.uid);
    return userRecord;
  } catch (error) {
    console.error('Error creating new user:', error);
  }
};

module.exports = { createFirebaseUser }
