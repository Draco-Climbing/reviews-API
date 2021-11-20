import mongoose from 'mongoose';

let MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://localhost/sdc');

// connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// set up schema for collections
var Schema = mongoose.Schema;

// will be used for POST /reviews route
// will be queried for GET /reviews route
// will also need to update document during PUT request to
// /reviews/:review_id/report route and /reviews/:review_id/helpful
const reviewsSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    select: false
  },
  id: {
    type: Number,
    select: false
  },
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
    required: false
  },
  // data will come from reviews.csv
  body: String,
  // data will come from reviews.csv
  date: Date,
  // data will come from reviews.csv
  reported: Boolean,
  // data will come from reviews.csv
  reviewer_name: String,
  // data will come from reviews.csv
  reviewer_email: String,
  // data will come from reviews.csv
  helpfulness: Number,
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

// will be updated in the POST /reviews request
// will be queried in the GET /reviews/ request
const reviewsphotosSchema = new Schema({
  // data will come from review_photos.csv
  id: Number,
  // data will come from review_photos.csv
  url: String,
  // data will come from review_photos.csv but will be pulled in by virtual property
  review_id: {
    type: Number,
    ref: 'reviews',
    localField: 'review_id',
    foreignField: 'review_id'
  },
});

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
    ref: 'characteristics'
  }
});

const characteristicsSchema = new Schema({
  _id: Number,
  product_id: Number,
  name: String,
});

// create virtual field for reviews that will be used in virtual population
reviewsSchema.virtual('photos', {
  ref: 'reviewsphotos',
  localField: 'review_id',
  foreignField: 'review_id',
});

let reviews = mongoose.model('reviews', reviewsSchema);
let reviewsphotos = mongoose.model('reviewsphotos', reviewsphotosSchema);
let characteristicReviews = mongoose.model('characteristicreviews', characteristicReviewsSchema);
let characteristics = mongoose.model('characteristics', characteristicsSchema);

// export function create(type, entry) {
//   let document;

//   if (type === 'reviews') {
//     document = new reviews(entry);
//   } else if (type === 'photos') {
//     document = new reviewsPhotos(entry);
//   } else if (type === 'characteristics') {
//     document = new characteristicReviews(entry);
//     // document = new characteristics(entry);
//   }

//   db.collection(type).insertOne(document)
//     .catch(console.log);
// };

export function read(type, query = {}) {
  console.log('will try to read database')

  if (type === 'reviews') {
    var sortObject;
    if (query.sort === 'helpful') {
      sortObject = {helpfulness: -1};
    } else if (query.sort === 'relevant') {
      sortObject = { helpfulness: -1, date: -1 }
    } else {
      sortObject = { date: -1 };
    }

    // search for reviews with specific product id that have not been reported
    return reviews.find({ 'product_id': query.product_id, 'reported': false })
      .sort(sortObject)
      .skip(query.count * (query.page - 1))
      .limit(query.count)
      .populate({ path: 'photos', select: 'url id -_id -review_id' })
      .select({
        'review_id': 1,
        'rating': 1,
        'summary': 1,
        'recommend': 1,
        'response': 1,
        'body': 1,
        'date': 1,
        'reviewer_name': 1,
        'helpfulness': 1,
        'photos': 1
      })
      .exec();
  } else if (type === 'characteristics') {
    return characteristics.find({ 'product_id': query.product_id })
      .select({_id: 0, name: 1})
      .exec();
  }
};

export const db = mongoose.connection;