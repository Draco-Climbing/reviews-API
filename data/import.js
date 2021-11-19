import { exec } from 'child_process';
let command;

const files = ['reviews', 'characteristics', 'characteristic_reviews', 'reviews_photos'];
const collections = ['reviews', 'characteristics', 'characteristicreviews', 'reviewsphotos'];

console.log('starting execution');

files.forEach((item, index) => {
  command = `mongoimport -d sdc -c ${collections[index]} --headerline --columnsHaveTypes --type="csv" ${item}.csv`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${error}`);
    } else if (stderr) {
      console.error(`stderr: ${stderr}`);
    } else {
      console.log(`stdout: ${stdout}`);
      console.log(`${item}.csv was imported successfully`);
    }
  })
})
