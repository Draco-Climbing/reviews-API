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
    required: true,
    default: null
  },
  // data will come from reviews.csv
  body: String,
  // data will come from reviews.csv
  date: Date,
  // data will come from reviews.csv
  reported: {
    type: Boolean,
    required: true,
    default: false
  },
  // data will come from reviews.csv
  reviewer_name: String,
  // data will come from reviews.csv
  reviewer_email: String,
  // data will come from reviews.csv
  helpfulness: Number,
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
  versionKey: false
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
}, {versionKey: false});

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
}, {versionKey: false});

const characteristicsSchema = new Schema({
  _id: Number,
  product_id: Number,
  name: String,
}, {versionKey: false});

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

const db = mongoose.connection;
export default db;

export function read(type, query = {}) {
  console.log(`going to read database for ${type}`)

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
      //
      .select({
        '_id': 0,
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
    return [
      reviews.aggregate([
        {$match: { product_id: query.product_id}},
        {$project: {_id: 0, recommend: 1, rating: 1}},
        // //  trying to make two buckets where things are grouped by rating and by recommend
        // {$bucket: {
        //   groupBy: '$rating',
        //   boundaries: [0, 2, 3, 4, 6],
        //   default: 'no_rating',
        //   output: {
        //     rating_count: {$sum: 1},
        //   }
        // }}
      ]),
      characteristics.aggregate([
        {$match: { product_id: query.product_id}},
        {$lookup: {
          from: 'characteristicreviews',
          localField: '_id',
          foreignField: 'characteristic_id',
          as: 'value',
        }},
        {$project: {_id: 0, product_id: 0}}
      ])
    ];
  } else if (type === 'lastReviewId') {
    return reviews.findOne({})
      .sort({review_id: -1}) // need to get the last review_id
      .select({_id: 0, review_id: 1})
      .exec();
  } else if (type === 'lastCharacteristicReviewId') {
    return characteristicReviews.findOne({})
      .sort({_id: -1}) // need to get the last _id
      .select({_id: 1})
      .exec();
  } else if (type === 'lastPhotoId') {
    return reviewsphotos.findOne({})
      .sort({id: -1}) // need to get the last id
      .select({_id: 0, id: 1})
      .exec();
  }
};

export function create(type, document) {
  if (type === 'review') {
    return reviews.create(document, null, (err, result) => {
      if (err) {
        console.log(err);
        return handleError(err);
      } else {
        console.log(result);
        return result;
      }
    });
  } else if (type === 'reviewphotos') {
    return reviewsphotos.create(document, null, (err, result) => {
      if (err) {
        console.log(err);
        return handleError(err);
      } else {
        console.log(result);
        return result;
      }
    });
  } else if (type === 'characteristicreview') {
    return characteristicReviews.create(document, null, (err, result) => {
      if (err) {
        console.log(err);
        return handleError(err);
      } else {
        console.log(result);
        return result;
      }
    });
  }
}

export function update() {
  //
}