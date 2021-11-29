/* eslint-disable no-console */
import { exec } from 'child_process';

const db = 'sdc';

const files = ['reviews', 'characteristics', 'characteristic_reviews', 'reviews_photos'];
const collections = ['reviews', 'characteristics', 'characteristicreviews', 'reviewsphotos'];

console.log('starting execution');

files.forEach((item, index) => {
  // --drop drops the instance before importing the new one
  const command = `mongoimport -d ${db} -c ${collections[index]} --headerline --columnsHaveTypes --drop --type="csv" ./data/${item}.csv`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
    } else if (stderr) {
      console.error(`stderr: ${stderr}`);
    } else {
      console.log(`stdout: ${stdout}`);
      console.log(`${item}.csv was imported successfully`);
    }
  });
});
