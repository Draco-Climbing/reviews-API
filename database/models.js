const mongoose = require('mongoose');

// set up schema for collections
const { Schema } = mongoose;

// will be used for POST /reviews route
// will be queried for GET /reviews route
// will also need to update document during PUT request to
// /reviews/:review_id/report route and /reviews/:review_id/helpful
const reviewsSchema = new Schema({
  // data will come from reviews.csv
  review_id: Number,
  // data will come from reviews.csv
  product_id: String,
  // data will come from reviews.csv
  rating: Number,
  // data will come from reviews.csv
  summary: String,
  // data will come from reviews.csv
  recommend: Boolean,
  // data will come from reviews.csv
  response: {
    type: String,
    required: true,
    default: null,
  },
  // data will come from reviews.csv
  body: String,
  // data will come from reviews.csv
  date: Date,
  // data will come from reviews.csv
  reported: {
    type: Boolean,
    required: true,
    default: false,
  },
  // data will come from reviews.csv
  reviewer_name: String,
  // data will come from reviews.csv
  reviewer_email: String,
  // data will come from reviews.csv
  helpfulness: Number,
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  versionKey: false,
});

// will be updated in the POST /reviews request
// will be queried in the GET /reviews/ request
const reviewsphotosSchema = new Schema({
  // data will come from review_photos.csv
  id: {
    type: Number,
    unique: true,
  },
  // data will come from review_photos.csv
  url: String,
  // data will come from review_photos.csv but will be pulled in by virtual property
  review_id: {
    type: Number,
    ref: 'reviews',
    localField: 'review_id',
    foreignField: 'review_id',
  },
}, { versionKey: false });

// will be queried in GET /reviews/meta request
// value will be updated in POST /reviews/ request
const characteristicReviewsSchema = new Schema({
  // data will come from characteristics_reviews.csv and characteristics.csv
  _id: Number,
  // data will come from characteristics_reviews.csv
  review_id: Number,
  // data will come from characteristics_reviews.csv
  value: Number,
  // data will come from characteristics_reviews.csv and characteristics.csv
  characteristic: {
    type: Number,
    ref: 'characteristics',
  },
}, { versionKey: false });

const characteristicsSchema = new Schema({
  _id: Number,
  product_id: String,
  name: String,
}, { versionKey: false });

// create virtual field for reviews that will be used in virtual population
reviewsSchema.virtual('photos', {
  ref: 'reviewsphotos',
  localField: 'review_id',
  foreignField: 'review_id',
});

module.exports.reviews = mongoose.model('reviews', reviewsSchema);
module.exports.reviewsphotos = mongoose.model('reviewsphotos', reviewsphotosSchema);
module.exports.characteristicReviews = mongoose.model('characteristicreviews', characteristicReviewsSchema);
module.exports.characteristics = mongoose.model('characteristics', characteristicsSchema);
