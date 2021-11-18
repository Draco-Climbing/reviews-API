import express from 'express'
import read, {create} from '../database/index.js'

let app = express();

app.use(express.json());

app.get('/reviews/', (req, res) => {
  console.log(`responding to GET request for ${JSON.stringify(req.query)}`);

  // ensure product_id query value is passed in
  if (req.query.product_id === undefined) {
    res.send('Error: invalid product_id provided');
  } else {
    // create query variable to handle different properties
    var query = {
      // set product_id to be an int instead of a string
      product_id: parseInt(req.query.product_id),
      // read properties from req.query or set to defaults
      count: (req.query.count || 5),
      page: (req.query.page || 1),
      sort: (req.query.sort || 'newest'),
    };

    // result is a cursor?
    var result = read('reviews', query)
    // .limit(query.count).sort({date: 1})
      .then((result) => {
        console.log(result);
        res.send();
      })
      .catch(console.log);

    // console.log(result);

    console.log('finished searching');
    // res.send();
  }
})

let port = (process.env.PORT || 8080);

app.listen(port, () => {
  console.log(`active on http://localhost:${port}`);
})