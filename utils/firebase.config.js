const serviceAccount = require('../utils/video-streaming-b21bb-firebase-adminsdk-dvfcs-579ff7e773.json');
const admin = require('firebase-admin');
require('dotenv').config();

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
    storageBucket:process.env.firebase_storage_url
})
const bucket = admin.storage().bucket();

module.exports= bucket