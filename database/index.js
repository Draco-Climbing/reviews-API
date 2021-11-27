/* eslint-disable camelcase */
import mongoose from 'mongoose';

const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://localhost/sdc');

// connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// set up schema for collections
const { Schema } = mongoose;

// will be used for POST /reviews route
// will be queried for GET /reviews route
// will also need to update document during PUT request to
// /reviews/:review_id/report route and /reviews/:review_id/helpful
const reviewsSchema = new Schema({
  id: {
    type: Number,
    select: false,
    unique: true,
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
  _id: {
    type: Number,
    unique: true,
  },
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

const reviews = mongoose.model('reviews', reviewsSchema);
const reviewsphotos = mongoose.model('reviewsphotos', reviewsphotosSchema);
const characteristicReviews = mongoose.model('characteristicreviews', characteristicReviewsSchema);
const characteristics = mongoose.model('characteristics', characteristicsSchema);

const db = mongoose.connection;
export default db;

export function read(type, query = {}) {
  console.log(`going to read database for ${type}`);

  if (type === 'reviews') {
    let sortObject;
    if (query.sort === 'helpful') {
      sortObject = { helpfulness: -1 };
    } else if (query.sort === 'relevant') {
      sortObject = { helpfulness: -1, date: -1 };
    } else {
      sortObject = { date: -1 };
    }

    // search for reviews with specific product id that have not been reported
    return reviews
      // This is the mongoose way to return the nested result object
      .find({ product_id: query.product_id, reported: false })
      .sort(sortObject)
      .skip(query.count * (query.page - 1))
      .limit(query.count)
      .populate({ path: 'photos', select: 'url id -_id -review_id' })
      //
      .select({
        _id: 0,
        review_id: 1,
        rating: 1,
        summary: 1,
        recommend: 1,
        response: 1,
        body: 1,
        date: 1,
        reviewer_name: 1,
        helpfulness: 1,
        photos: 1,
      })
      .exec();

    // // this is the mongo aggragate pipeline way to do the same as the way shown above.
    // .aggregate([
    //   {$match: {product_id: query.product_id, reported: false}},
    //   {$sort: sortObject},
    //   {$skip: (query.count * (query.page - 1))},
    //   {$limit: query.count},
    //   {$lookup: {
    //     from: 'reviewsphotos',
    //     localField: 'review_id',
    //     foreignField: 'review_id',
    //     as: 'photos',
    //     pipeline: [{$project: {_id: 0, review_id: 0}}]
    //   }},
    //   {$project: {
    //       '_id': 0,
    //       'review_id': 1,
    //       'rating': 1,
    //       'summary': 1,
    //       'recommend': 1,
    //       'response': 1,
    //       'body': 1,
    //       'date': 1,
    //       'reviewer_name': 1,
    //       'helpfulness': 1,
    //       'photos': 1
    //     }},
    // ])
  } if (type === 'characteristics') {
    return [
      reviews.aggregate([
        { $match: { product_id: query.product_id } },
        // run two facets/queries
        {
          $facet: {
          // create ratings object
            ratings: [
            // in ratings pipeline group items
              {
                $group: {
                  // group by product id
                  _id: '$product_id',
                  // and conditionals where rating must equal specific value
                  1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                  2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                  3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                  4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                  5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                },
              },
              // don't show _id
              { $project: { _id: 0 } },
            ],
            recommended: [
              {
                $group: {
                  _id: '$product_id',
                  // group by true or false conditions of recommend
                  true: { $sum: { $cond: ['$recommend', 1, 0] } },
                  false: { $sum: { $cond: ['$recommend', 0, 1] } },
                },
              },
              { $project: { _id: 0 } },
            ],
          },
        },
        // show the first result from each array which is just the result object
        {
          $project: {
            ratings: { $first: '$ratings' },
            recommended: { $first: '$recommended' },
          },
        },
      ]),
      characteristics.aggregate([
        { $match: { product_id: query.product_id } },
        {
          $lookup: {
            from: 'characteristicreviews',
            localField: '_id',
            foreignField: 'characteristic_id',
            as: 'value',
            pipeline: [
            // group by characteristic_id and calculate average review values
              { $group: { _id: '$characteristic_id', value: { $avg: '$value' } } },
              // round review values
              { $project: { _id: 0, value: { $round: ['$value', 4] } } },
            ],
          },
        },
        // unwind array of value that comes in from nested pipeline above
        { $unwind: '$value' },
        // show the nested value object's value as a string and show _id (characteristic id) as id
        {
          $project: {
            _id: 0, id: '$_id', name: 1, value: { $toString: '$value.value' },
          },
        },
      ]),
    ];
  } if (type === 'verifyCharacteristics') {
    // only get the characteristic ids that correspond to the product_id
    return characteristics
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: '_id',
            values: { $push: '$_id' },
          },
        },
        { $project: { values: 1, _id: 0 } },
      ]);
  } if (type === 'lastReviewId') {
    return reviews.findOne({})
      .sort({ review_id: -1 }) // need to get the last review_id
      .select({ _id: 0, review_id: 1 })
      .exec();
  } if (type === 'lastCharacteristicReviewId') {
    return characteristicReviews.findOne({})
      .sort({ _id: -1 }) // need to get the last _id
      .select({ _id: 1 })
      .exec();
  } if (type === 'lastPhotoId') {
    return reviewsphotos.findOne({})
      .sort({ id: -1 }) // need to get the last id
      .select({ _id: 0, id: 1 })
      .exec();
  }
}

export function create(type, document) {
  if (type === 'review') {
    return reviews.create(document, null, (err, result) => {
      if (err) {
        console.log(err);
        return Error(err);
      }
      // console.log(result);
      return result;
    });
  } if (type === 'reviewphotos') {
    return reviewsphotos.create(document, null, (err, result) => {
      if (err) {
        console.log(err);
        return Error(err);
      }
      // console.log(result);
      return result;
    });
  } if (type === 'characteristicreview') {
    return characteristicReviews.create(document, null, (err, result) => {
      if (err) {
        console.log(err);
        return Error(err);
      }
      // console.log(result);
      return result;
    });
  }
}

export function update(type, review_id) {
  if (type === 'helpful') {
    return reviews.updateOne({ review_id }, {
      $inc: { helpfulness: 1 },
    }).exec();
  } if (type === 'report') {
    return reviews.updateOne({ review_id }, {
      $set: { reported: true },
    }).exec();
  }
}
