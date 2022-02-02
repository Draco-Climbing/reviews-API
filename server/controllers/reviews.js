/* eslint-disable camelcase */
const {
  readReviews,
  verifyCharacteristics,
  getLastReviewId,
  getLastCharacteristicsId,
  getLastPhotoId,
  createReview,
  createReviewPhotos,
  createCharacteristicReview,
  updateHelpful,
  updateReport,
} = require('../../database/index');

module.exports = {
  read: (req, res) => {
    // ensure product_id query value is passed in
    if (req.query.product_id === undefined) {
      res.status(404).send('Error: invalid product_id provided');
      return;
    }
    console.log(req.query);

    // read will already incorporate the sort and limit numbers
    readReviews({
    // set product_id to be an int instead of a string
      product_id: req.query.product_id,
      // read properties from req.query or set to defaults
      count: (parseInt(req.query.count, 10) || 5),
      // page will determine which result of count will be returned
      // so page 2 with count 5 will return the second set of 5 results
      page: (parseInt(req.query.page, 10) || 1),
      sort: (req.query.sort || 'newest'),
    })
      .then((results) => {
      // results[response] = results[response] === 'null' ? null : results[response];
        res.send({
          product_id: req.query.product_id,
          page: (parseInt(req.query.page, 10) || 1),
          count: (parseInt(req.query.count, 10) || 5),
          results,
        });
      })
      .catch((err) => {
      // console.log(err);
        res.status(500).send(err);
      });
  },
  create: (req, res) => {
    // need to use product_id to insert into reviews
  // into reviews will need to generate a unique id and a date
  /**
   * The reponse object will come in with the following structure:
   * {
   *   product_id: integer,
   *   rating: int,
   *   summary: text,
   *   body: text,
   *   recommend: bool,
   *   name: text,
   *   email: text,
   *   photos: [text],
   *   characteristics: {
   *     characteristics_id: int,
   *     characteristics_id: int
   *   }
   * }
   */
    // const [lastReviewId] = await Promise.all([
    // read('reviewId', {product_id: req.body.product_id}),
    // read('lastReviewId',{})
    // ])

    verifyCharacteristics({ product_id: String(req.body.product_id) })
    // can deconstruct the object values in an array into the values variable
      .then(([{ values }]) => {
        // check that the characteristic id being sent with the review corresponds
        // to the values for that product id
        Object.keys(req.body.characteristics).forEach((item) => {
          if (!values.includes(Number(item))) {
            throw Error('error writting to database, check that all parameters are correct');
          }
        });
      })
      .then(() => {
        Promise.all([getLastReviewId(), getLastCharacteristicsId(), getLastPhotoId()])
          .then(([lastReviewId, lastCharacteristicId, lastPhotoId]) => {
            const { review_id } = lastReviewId;
            const { _id } = lastCharacteristicId;
            const { id } = lastPhotoId;

            // need to create review object
            // that will become the document written into reviews collection
            const review = {
              review_id: review_id + 1,
              product_id: String(req.body.product_id),
              rating: req.body.rating,
              date: new Date(),
              summary: req.body.summary,
              body: req.body.body,
              recommend: req.body.recommend,
              reported: false,
              reviewer_name: req.body.name,
              reviewer_email: req.body.email,
              response: req.body.response ? req.body.response : 'null',
              helpfulness: 0,
            };

            Promise.all(
              [createReview([review])]
                .concat(
                  createCharacteristicReview(
                    Object.keys(req.body.characteristics)
                      .map((item, index) => ({
                        _id: _id + 1 + index,
                        characteristic_id: Number(item),
                        review_id: review_id + 1,
                        value: req.body.characteristics[item],
                      })),
                  ),
                  createReviewPhotos(
                    req.body.photos.slice(0, 5)
                      .map((photo, i) => ({
                        id: id + 1 + i,
                        review_id: review_id + 1,
                        url: photo,
                      })),
                  ),
                ),
            )
              .then(() => {
                // console.log('documents were created and added to collection successfully');
                res.status(201).send('review was created successfully');
              });
          });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(err);
      });
  },
  helpful: (req, res) => {
    if (!req.params.review_id) {
      res.status(404).send('Error: invalid review_id provided');
    } else {
      updateHelpful(req.params.review_id)
        .then((response) => {
          if (response.acknowledged) {
            // console.log(response);
            res.status(204).send();
          } else {
            res.status(500).send('server error marking review as helpful');
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('server error marking review as helpful');
        });
    }
  },
  report: (req, res) => {
    if (!req.params.review_id) {
      res.status(404).send('Error: invalid review_id provided');
    } else {
      updateReport(req.params.review_id)
        .then((response) => {
          if (response.acknowledged) {
            // console.log(response);
            res.status(204).send();
          } else {
            res.status(500).send('server error reporting review');
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('server error reporting review');
        });
    }
  },
};
