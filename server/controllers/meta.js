const { readCharacteristics } = require('../../database/index');

module.exports = {
  read: async (req, res) => {
  // console.log(`responding to GET request on /reviews/meta/ for ${JSON.stringify(req.query)}`);

    // ensure product_id query value is passed in
    if (req.query.product_id === undefined) {
      res.status(404).send('Error: invalid product_id provided');
    } else {
      const [reviews, chars] = await Promise.all(readCharacteristics(req.query));
      if (reviews.length === 0) {
        res.status(404).send('There are no reviews for that product_id or product_id does not exist.');
        return;
      }
      // create and populate characteristics object
      const characteristics = {};
      chars.forEach((item) => {
        characteristics[item.name] = {
          id: item.id,
          value: item.value,
        };
      });

      res.send({
        product_id: req.query.product_id,
        ratings: reviews[0].ratings,
        recommended: reviews[0].recommended,
        characteristics,
      });
    }
  },
};
