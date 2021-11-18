import { Db } from 'mongodb';
import mongoose from 'mongoose';

let MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://localhost/sdc');

// connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// set up schema for collections
// will be used for POST /reviews route
// will be queried for GET /reviews route
// will also need to update document during PUT request to
// /reviews/:review_id/report route and /reviews/:review_id/helpful
const reviewsSchema = mongoose.Schema({
  // data will come from reviews.csv
  _id: Number,
  // data will come from reviews.csv
  product_id: Number,
  // data will come from reviews.csv
  rating: Number,
  // data will come from reviews.csv
  date: Date,
  // data will come from reviews.csv
  summary: String,
  // data will come from reviews.csv
  body: String,
  // data will come from reviews.csv
  recommend: Boolean,
  // data will come from reviews.csv
  reported: Boolean,
  // data will come from reviews.csv
  reviewer_name: String,
  // data will come from reviews.csv
  reviewer_email: String,
  // data will come from reviews.csv
  response: String,
  // data will come from reviews.csv
  helpfulness: Number,

  // // data will come from review_photos.csv
  // photos: Array,
  // // data will come from review_characteristics.csv and characteristics.csv
  // characteristics: Object,
});

// will be updated in the POST /reviews request
// will be queried in the GET /reviews/ request
const photosSchema = mongoose.Schema({
  // data will come from review_photos.csv
  _id: Number,
  // data will come from review_photos.csv
  review_id: Number,
  // data will come from review_photos.csv
  url: String,
});

// will be queried on the GET reviews/meta request
// will be updated on the POST /reviews request
const recommendedSchema = mongoose.Schema({
  // _id will be unique and will be product id
  _id: Number,
  // data will come from adding values in reviews.csv
  false: Number,
  // data will come from adding values in reviews.csv
  true: Number
})

// will be queried on the GET reviews/meta request
// will be updated on POST /reviews request
const ratingsSchema = mongoose.Schema({
  // _id will be unique and will be product_id
  _id: Number,
  // data will come from adding values in reviews.csv for a specific product_id
  1: Number,
  // data will come from adding values in reviews.csv for a specific product_id
  2: Number,
  // data will come from adding values in reviews.csv for a specific product_id
  3: Number,
  // data will come from adding values in reviews.csv for a specific product_id
  4: Number,
  // data will come from adding values in reviews.csv for a specific product_id
  5: Number,
});

// will be queried in GET /reviews/meta request
// value will be updated in POST /reviews/ request
const characteristicsSchema = mongoose.Schema({
  // data will come from characteristics_reviews.csv and characteristics.csv
  _id: Number,
  // data will come from characteristics_reviews.csv
  review_id: Number,
  // data will come from characteristics_reviews.csv
  value: Number,
  // data will come from characteristics_reviews.csv and characteristics.csv
  characteristic: String,
});

let reviews = mongoose.model('reviews', reviewsSchema);
// let reviewsPhotos = mongoose.model('photos', photosSchema);
// let recommended = mongoose.model('recommended', recommendedSchema);
// let ratings = mongoose.model('ratings', ratingsSchema);
// let characteristics = mongoose.model('characteristics', characteristicsSchema);

export function create(type, entry) {
  let document;

  if (type === 'reviews') {
    document = new reviews(entry);
  } else if (type === 'photos') {
    document = new photos(entry);
  } else if (type === 'recommended') {
    document = new recommended(entry);
  } else if (type === 'ratings') {
    document = new ratings(entry);
  } else if (type === 'characteristics') {
    document = new characteristics(entry);
  }

  mongoose.connection.collection(type).insertOne(document)
    .catch(console.log);
};

export default async function read(type, query = {}) {
  console.log('will try to read database')
  console.log(type)

  if (type === 'reviews') {
    console.log(`will try to find product_id: ${query.product_id} in ${type}`);
    console.log(`will limit results to a count of ${query.count} or ${query.page} page(s)`);
    return await reviews.find({"product_id": query.product_id}, (err, result) => {
      if (err) {
        throw err;
      } else {
        console.log(result);
        return result;
      }
    });
  } else if (type === 'photos') {
    return photos.find(query);
  } else if (type === 'recommended') {
    return recommended.find(query);
  } else if (type === 'ratings') {
    return ratings.find(query);
  } else if (type === 'characteristics') {
    return characteristics.find(query);
  }

};

// export function update (collection, field, entry) {
//   //
// };