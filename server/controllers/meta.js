const { readCharacteristics } = require('../../database/index');
const { handleError } = require('../utils/utils');

module.exports = {
  read: async (req, res) => {
    // ensure product_id query value is passed in
    if (req.query.product_id === undefined || Number.isNaN(Number(req.query.product_id))) {
      return handleError(res, {
        response: {
          status: 404,
          data: { message: 'Error: invalid product_id provided!' },
        },
      });
    }

    const [reviews, chars] = await Promise.all(readCharacteristics(req.query));

    if (reviews.length === 0) {
      return handleError(res, {
        response: {
          status: 404,
          data: 'There are no reviews for that product_id or product_id does not exist.',
        },
      });
    }

    // create and populate characteristics object
    const characteristics = {};
    chars.forEach((item) => {
      characteristics[item.name] = {
        id: item.id,
        value: item.value,
      };
    });

    return res.send({
      product_id: req.query.product_id,
      ratings: reviews[0].ratings,
      recommended: reviews[0].recommended,
      characteristics,
    });
  },
};
