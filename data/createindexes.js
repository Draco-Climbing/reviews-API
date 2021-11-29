import mongoose from 'mongoose';

const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://localhost/sdc');

// connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.collection('reviews').createIndexes([
  { review_id: 1, name: 'review_id_1' }, { product_id: 1, name: 'product_id_1' },
]);
db.collection('reviewsphotos').createIndexes([{ review_id: 1, name: 'review_id_1' }]);
db.collection('characteristics').createIndexes([{ product_id: 1, name: 'product_id_1' }]);
db.collection('characteristicreviews').createIndexes([{ review_id: 1, name: 'review_id_1' }, { characteristic_id: 1, name: 'chracteristic_id_1' }]);
