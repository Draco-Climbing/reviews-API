/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
const {
  reviews, reviewsphotos, characteristicReviews, characteristics,
} = require('./models');

module.exports = {
  readReviews: (query) => {
    let sortObject = { date: -1 };

    // modify sort Object if if rating is specified
    if (query.sort === 'helpful') {
      sortObject = { helpfulness: -1 };
    } else if (query.sort === 'relevant') {
      sortObject.helpfulness = -1;
    }

    // search for reviews with specific product id that have not been reported
    // this is the mongo aggragate pipeline way to do the same as the way shown above.
    return reviews
      .aggregate([
        { $match: { product_id: query.product_id, reported: false } },
        { $sort: sortObject },
        { $skip: (query.count * (query.page - 1)) },
        { $limit: query.count },
        {
          $lookup: {
            from: 'reviewsphotos',
            localField: 'review_id',
            foreignField: 'review_id',
            as: 'photos',
            pipeline: [{ $project: { _id: 0, review_id: 0 } }],
          },
        },
        {
          $project: {
            _id: 0,
            review_id: 1,
            rating: 1,
            summary: 1,
            recommend: 1,
            response: 1,
            body: 1,
            date: { $toDate: '$date' },
            reviewer_name: 1,
            helpfulness: 1,
            photos: 1,
          },
        },
      ]);

    // // This is the mongoose way to return the nested result object
    // .find({ product_id: query.product_id, reported: false })
    // .sort(sortObject)
    // .skip(query.count * (query.page - 1))
    // .limit(query.count)
    // .populate({ path: 'photos', select: 'url id -_id -review_id' })
    // //
    // .select({
    //   _id: 0,
    //   review_id: 1,
    //   rating: 1,
    //   summary: 1,
    //   recommend: 1,
    //   response: 1,
    //   body: 1,
    //   date: 1,
    //   reviewer_name: 1,
    //   helpfulness: 1,
    //   photos: 1,
    // })
    // .exec();
  },
  readCharacteristics: (query) => [
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
        $project: { ratings: { $first: '$ratings' }, recommended: { $first: '$recommended' } },
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
  ],
  verifyCharacteristics: (query) => characteristics
    .aggregate([
      { $match: query },
      { $group: { _id: '_id', values: { $push: '$_id' } } },
      { $project: { values: 1, _id: 0 } },
    ]),
  getLastReviewId: () => reviews.findOne({})
    .sort({ review_id: -1 }) // need to get the last review_id
    .select({ _id: 0, review_id: 1 })
    .exec(),
  getLastCharacteristicsId: () => characteristicReviews.findOne({})
    .sort({ _id: -1 }) // need to get the last _id
    .select({ _id: 1 })
    .exec(),
  getLastPhotoId: () => reviewsphotos.findOne({})
    .sort({ id: -1 }) // need to get the last id
    .select({ _id: 0, id: 1 })
    .exec(),
  createReview: (document) => reviews.create(document, null, (err, result) => {
    if (err) {
      console.error(err);
      return Error(err);
    }
    // console.log(result);
    return result;
  }),
  createReviewPhotos: (document) => reviewsphotos
    .create(document, null, (err, result) => {
      if (err) {
        console.error(err);
        return Error(err);
      }
      // console.log(result);
      return result;
    }),
  createCharacteristicReview: (document) => characteristicReviews
    .create(document, null, (err, result) => {
      if (err) {
        console.error(err);
        return Error(err);
      }
      // console.log(result);
      return result;
    }),
  updateHelpful: (review_id) => {
    reviews.updateOne({ review_id }, {
      $inc: { helpfulness: 1 },
    }).exec();
  },
  updateReport: (review_id) => reviews.updateOne({ review_id }, {
    $set: { reported: true },
  }).exec(),
};
