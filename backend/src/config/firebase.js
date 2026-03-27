const admin = require('firebase-admin');
const path = require('path');


try {
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
    
    const db = admin.firestore();
    console.log('Firebase Admin SDK Initialized Successfully');
} catch (error) {
    console.warn('Firebase Admin SDK: serviceAccountKey.json not found or invalid.');
    console.warn('Proceeding with placeholder initialization...');

    if (!admin.apps.length) {
    }
}

const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;

module.exports = { admin, db, auth };
