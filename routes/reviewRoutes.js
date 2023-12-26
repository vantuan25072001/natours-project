const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });
//POST /tour/234343343/reviews
//GET /tour/34324324/reviews
//POST /reviews
// / ở đây là ngạch sau reviews vì theo tuyến đường lồng nhau.

//MIddleware bảo vệ trước khi chạy các tuyến đường
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;
