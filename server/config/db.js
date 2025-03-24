require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('--> Connected to MongoDB');
    } 
    catch (err) {
        console.error('--> Could not connect to MongoDB. Try again later.', err);
        process.exit(1);
    }
};

module.exports = connectDB;