const router = require('express').Router();
const controller = require('../controllers');

router.get('/reviews/', controller.reviews.read);
router.get('/reviews/meta/', controller.meta.read);

router.post('/reviews/', controller.reviews.create);

router.put('/reviews/:review_id/helpful', controller.reviews.helpful);
router.put('/reviews/:review_id/report', controller.reviews.report);

module.exports = router;
