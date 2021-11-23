import axios from 'axios';
import express, { response } from 'express'
import db, {read, create, update} from '../database/index.js'

let app = express();

app.use(express.json());

/*
 /reviews/ route is using a function imported from database file, read
 read uses .find() and does the filtering/sorting/object creation and then returns a promise
*/
app.get('/reviews/', (req, res) => {
  console.log(`responding to GET request on /reviews/ for ${JSON.stringify(req.query)}`);

  // ensure product_id query value is passed in
  if (req.query.product_id === undefined) {
    res.status(404).send('Error: invalid product_id provided');
    return;
  } else {
    // read will already incorporate the sort and limit numbers
    read('reviews', {
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
        if (results.length === 0) {
          res.status(404).send('There are no reviews for that product_id or product_id does not exist.');
        }
        console.log(results);
        results[response] = results[response] === 'null' ? null : results[response];

        console.log('finished searching');
        res.send({
          product_id: req.query.product_id,
          page: (parseInt(req.query.page, 10) || 1),
          count: (parseInt(req.query.count, 10) || 5),
          results,
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(err);
      });

  }
})

/*
 The /reviews/meta/ route will be using the aggregation pipeline to query, sort, and build
 the object being returned from mongoDB
*/
app.get('/reviews/meta/', async (req, res) => {
  console.log(`responding to GET request on /reviews/meta/ for ${JSON.stringify(req.query)}`);

  // ensure product_id query value is passed in
  if (req.query.product_id === undefined) {
    res.status(404).send('Error: invalid product_id provided');
  } else {
    const [reviews, chars] = await Promise.all(read('characteristics', req.query));
    if (reviews.length === 0) {
      res.status(404).send('There are no reviews for that product_id or product_id does not exist.');
      return;
    }

    // create recommended object so each field can be incremented
    const recommended = {'false': 0, 'true': 0}
    // create ratings object so each field can be incremented
    const ratings = {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0};

    // populate ratings object
    reviews.forEach(item => {
      recommended[item.recommend]++;
      ratings[item.rating]++;
    });

    // create and populate characteristics object
    let characteristics = {};
    chars.forEach(item => {
      characteristics[item.name] = {
        id: item.value[0].characteristic_id,
        value: String((item.value
          .reduce((prev, current) => prev + current.value, 0) / item.value.length)
          .toFixed(4))
      };
    });

    res.send({
      product_id: req.query.product_id,
      ratings,
      recommended,
      characteristics,
    });
  }
})

app.post('/reviews/', (req, res) => {
  console.log('responding to POST request on /reviews/');

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

  // **********************************************************************************************
  // **********************************************************************************************
  // TODO - somehwere I should validate that the characteristics do correspond to the product_id
  // **********************************************************************************************
  // **********************************************************************************************
  Promise.all([read('lastReviewId'),read('lastCharacteristicReviewId'), read('lastPhotoId')])
  .then(([lastReviewId, lastCharacteristicId, lastPhotoId]) => {
      const { review_id } = lastReviewId;
      const { _id } = lastCharacteristicId;
      const { id } = lastPhotoId;

      let review = {
        review_id: review_id + 1,
        product_id: req.body.product_id,
        rating: req.body.rating,
        date: new Date(),
        summary: req.body.summary,
        body: req.body.body,
        recommend: req.body.recommend,
        reported: false,
        reviewer_name: req.body.name,
        reviewer_email: req.body.email,
        response: req.body.response ? req.body.response : 'null',
        helpfulness: 0
      }

      Promise.all(
        [create('review', [review])]
          .concat(
            create('characteristicreview',
              Object.keys(req.body.characteristics)
                .map((item, index) => ({
                    _id: _id + 1 + index,
                    characteristic_id: Number(item),
                    review_id: review_id + 1,
                    value: req.body.characteristics[item]
                  })
                )
              ),
            create('reviewphotos',
              req.body.photos.slice(0, 5)
                .map((photo, i) => ({
                  id: id + 1 + i,
                  review_id: review_id + 1,
                  url: photo
                })
              )
            )
          )
        )
        .then(response => {
          console.log(response);
          res.status(201).send('review was created successfully');
        })
        .catch(err => {
          console.log(err);
          res.status(500).send(err);
        })
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    })
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  if (!req.params.review_id) {
    res.status(404).send('Error: invalid review_id provided');
  } else {
    console.log(req.params);
    update('helpful', req.params.review_id)
      .then((response) => {
        if (response.acknowledged) {
          console.log(response)
          res.status(204).send();
        } else {
          res.status(500).send('server error marking review as helpful');
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('server error marking review as helpful');
      })
  }
});

app.put('/reviews/:review_id/report', (req, res) => {
  if (!req.params.review_id) {
    res.status(404).send('Error: invalid review_id provided');
  } else {
    console.log(req.params);
    update('report', req.params.review_id)
      .then((response) => {
        if (response.acknowledged) {
          console.log(response)
          res.status(204).send();
        } else {
          res.status(500).send('server error reporting review');
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('server error reporting review');
      })
  }
});

let port = (process.env.PORT || 8080);

app.listen(port, () => {
  console.log(`active on http://localhost:${port}`);
})