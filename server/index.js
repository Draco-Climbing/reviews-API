import express from 'express'
import {db, read} from '../database/index.js'

let app = express();

app.use(express.json());

app.get('/reviews/', (req, res) => {
  console.log(`responding to GET request on /reviews/ for ${JSON.stringify(req.query)}`);

  // ensure product_id query value is passed in
  if (req.query.product_id === undefined) {
    res.send('Error: invalid product_id provided');
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

        console.log('finished searching');
        res.send({
          product_id: req.query.product_id,
          page: (parseInt(req.query.page, 10) || 1),
          count: (parseInt(req.query.count, 10) || 5),
          results,
        });
      })
      .catch(console.log);

  }
})

app.get('/reviews/meta/', (req, res) => {
  console.log(`responding to GET request on /reviews/meta/ for ${JSON.stringify(req.query)}`);
  db.collection('characteristics')
    .aggregate([
      {$match: {product_id: parseInt(req.query.product_id)}},
      {$project: {name: 1, _id: 0}},
    ])
    .toArray((err, results) => {
      if (err) {
        PromiseRejectionEvent(console.log('error getting characteristics'));
        res.status(404).send('error getting characteristics');
      } else {
        res.send(results);
      }
    });

})

app.post('/reviews/', (req, res) => {
  res.send();
});

let port = (process.env.PORT || 8080);

app.listen(port, () => {
  console.log(`active on http://localhost:${port}`);
})