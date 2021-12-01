echo "going to import files"
mongoimport -d sdc -c reviews --headerline --columnsHaveTypes --drop --type csv /seed/reviews.csv
mongoimport -d sdc -c reviewsphotos --headerline --columnsHaveTypes --drop --type csv /seed/reviews_photos.csv
mongoimport -d sdc -c characteristics --headerline --columnsHaveTypes --drop --type csv /seed/characteristics.csv
mongoimport -d sdc -c characteristicreviews --headerline --columnsHaveTypes --drop --type csv /seed/characteristic_reviews.csv

echo "done importing files"

echo "going to set indexes"
mongosh sdc --eval "db.reviews.createIndexes([{product_id: 1, reported: 1}, {review_id: 1}])"
mongosh sdc --eval "db.reviewsphotos.createIndexes([{review_id: 1}, {id: -1}])"
mongosh sdc --eval "db.characteristics.createIndexes([{product_id: 1}])"
mongosh sdc --eval "db.characteristicreviews.createIndexes([{review_id: 1}, {characteristic_id: 1}])"

echo "done setting indexes"
