const admin = require('firebase-admin');

// Link to firebase
var serviceAccount = require("./url-shortener-a50b6-firebase-adminsdk-3hysw-4a7981aa9f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://url-shortener-a50b6.firebaseio.com"
});

module.exports = admin.database();
