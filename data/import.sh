mongoimport -d sdc -c reviews --headerline --columnsHaveTypes --drop --type csv ../data/reviews.csv
mongoimport -d sdc -c reviewsphotos --headerline --columnsHaveTypes --drop --type csv ../data/reviews_photos.csv
mongoimport -d sdc -c characteristics --headerline --columnsHaveTypes --drop --type csv ../data/characteristics.csv
mongoimport -d sdc -c characteristicreviews --headerline --columnsHaveTypes --drop --type csv ../data/characteristic_reviews.csv