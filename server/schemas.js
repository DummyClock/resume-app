/*
    This file contains the schema for the User model.
    Import these schemas in routes.js to use MongoDB.
*/
const mongoose = require('mongoose');

// Define a User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

module.exports = User;