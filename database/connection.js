require('dotenv').config();
const mongoose = require('mongoose');

let MONGODB_URI = 'mongodb://localhost:27017/sdc';

if (process.env.MONGO_DB === 'sdc' && process.env.MONGO_CONNECTION === 'sdc-mongo') {
  MONGODB_URI = `mongodb://${process.env.MONGOIP}:27017/sdc`;
}

// connect to MongoDB
const db = mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db
  .then(() => console.log(`Connected to: ${MONGODB_URI}`))
  .catch((err) => {
    console.log(`There was a problem connecting to mongo at: ${MONGODB_URI}`);
    console.log(err);
  });

module.exports = db;
