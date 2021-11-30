// once imported, this script can be used to combine the reviews and the photos collections into one
db.reviews.aggregate([
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
      product_id: 1,
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
    },
  },
  { $out: { db: 'sdc', coll: 'combinedreviews' } },
]);
