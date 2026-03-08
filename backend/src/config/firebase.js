const admin = require('firebase-admin');
const path = require('path');

// NOTE: Replace the file below with your actual service account key JSON file
try {
    // If Render mounts the Secret File directly in the Root Directory (backend)
    // we should try to require it from the root first, and fallback to the local config folder.
    let serviceAccount;
    try {
        serviceAccount = require('../../serviceAccountKey.json');
    } catch {
        serviceAccount = require('./serviceAccountKey.json');
    }
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://helpmycar-7362b-default-rtdb.firebaseio.com"
    });
    // Firestore will be created in the region set in Firebase console (e.g., asia-south1 for India)
    const db = admin.firestore();
    // Optionally set Firestore settings here if needed
    // db.settings({ ignoreUndefinedProperties: true });
    console.log('Firebase Admin SDK Initialized Successfully');
} catch (error) {
    console.warn('Firebase Admin SDK: serviceAccountKey.json not found or invalid.');
    console.warn('Proceeding with placeholder initialization...');

    // Fallback for development/testing if user hasn't provided the key yet
    if (!admin.apps.length) {
        // This will only be useful once the key is provided
    }
}

const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;

module.exports = { admin, db, auth };
