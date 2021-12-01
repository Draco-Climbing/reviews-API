echo "going to import files"
mongoimport -d sdc -c reviews --headerline --columnsHaveTypes --drop --type csv /seed/reviews.csv
mongoimport -d sdc -c reviewsphotos --headerline --columnsHaveTypes --drop --type csv /seed/reviews_photos.csv
mongoimport -d sdc -c characteristics --headerline --columnsHaveTypes --drop --type csv /seed/characteristics.csv
mongoimport -d sdc -c characteristicreviews --headerline --columnsHaveTypes --drop --type csv /seed/characteristic_reviews.csv

echo "done importing files"

echo "going to set indexes one at a time"
mongosh sdc --eval "db.reviews.createIndex({product_id: 1, reported: 1})"
echo "###################### index created for reviews 1/2 ######################"
mongosh sdc --eval "db.reviews.createIndex({review_id: 1})"
echo "###################### index created for reviews 2/2 ######################"

mongosh sdc --eval "db.reviewsphotos.createIndex({review_id: 1})"
echo "###################### index created for reviewsphotos 1/2 ######################"
mongosh sdc --eval "db.reviewsphotos.createIndex({id: -1})"
echo "###################### index created for reviewsphotos 2/2 ######################"

mongosh sdc --eval "db.characteristics.createIndexes([{product_id: 1}])"
echo "###################### index created for characteristitcs 1/1 ######################"

mongosh sdc --eval "db.characteristicreviews.createIndex({review_id: 1})"
echo "###################### index created for characteristicreviews 1/2 ######################"
mongosh sdc --eval "db.characteristicreviews.createIndex({characteristic_id: 1})"
echo "###################### index created for characteristicreviews 2/2 ######################"

echo "done setting indexes"
