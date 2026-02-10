const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helpmycar');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        global.isConnected = true;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.log('!!! RUNNING IN MOCK MODE (No Database) !!!');
        global.isConnected = false;
        // Do NOT process.exit(1) so the server stays alive
    }
};

module.exports = connectDB;
