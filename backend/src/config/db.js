const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helpmycar', {
            serverSelectionTimeoutMS: 5000 // 5 second timeout
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.warn('Proceeding without MongoDB. Some features like Garages and Orders might not work, but Firebase-based Auth will function.');
    }
};

module.exports = connectDB;
