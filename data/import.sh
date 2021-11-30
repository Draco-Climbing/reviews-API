mongoimport -d sdc -c reviews --headerline --columnsHaveTypes --drop --type csv ../data/reviews.csv
mongoimport -d sdc -c reviewsphotos --headerline --columnsHaveTypes --drop --type csv ../data/reviews_photos.csv
mongoimport -d sdc -c characteristics --headerline --columnsHaveTypes --drop --type csv ../data/characteristics.csv
mongoimport -d sdc -c characteristicreviews --headerline --columnsHaveTypes --drop --type csv ../data/characteristic_reviews.csv

mongosh sdc --eval "db.reviews.createIndexes([{product_id: 1, reported: 1},{review_id: 1}])"
mongosh sdc --eval "db.reviewsphotos.createIndexes([{review_id: 1}, {id: -1}])"
mongosh sdc --eval "db.characteristics.createIndexes([{product_id: 1}])"
mongosh sdc --eval "db.characteristicreviews.createIndexes([{review_id: 1}, {characteristic_id: 1}])"
