db.reviews.createIndexes([
  { review_id: 1 }, { product_id: 1 },
]);
db.combined.createIndexes([
  { review_id: 1 }, { product_id: 1, reported: 1 },
]);
db.reviewsphotos.createIndexes([{ review_id: 1 }]);
db.characteristics.createIndexes([{ product_id: 1 }]);
db.characteristicreviews.createIndexes([{ review_id: 1 }, { characteristic_id: 1 }]);
