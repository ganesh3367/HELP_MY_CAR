const { db } = require('../config/firebase');




const submitFeedback = async (req, res) => {
    try {
        const { userId, userName, email, message, rating } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Please provide a message' });
        }

        const newFeedback = {
            userId: userId || 'anonymous',
            userName: userName || 'Anonymous',
            email: email || 'not-provided@example.com',
            message,
            rating: rating || 0,
            createdAt: new Date().toISOString()
        };

        if (db) {
            await db.collection('feedback').add(newFeedback);
        } else {
            console.log('Firebase not initialized. Feedback logged to console:', newFeedback);
        }

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: newFeedback
        });
    } catch (error) {
        console.error('Submit Feedback Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    submitFeedback
};
