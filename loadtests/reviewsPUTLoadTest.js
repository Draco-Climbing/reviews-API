/* eslint-disable import/no-unresolved */
import http from 'k6/http';
import { check, group } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.005'], // http errors should be less than 0.5%
    http_req_duration: [
      'p(99.99)<200', // 99.99% of requests should be below 200ms
      'p(99)<100', // 99% of requests should be below 100ms
      'p(97)<50', // 97% of requests should be below 50ms
    ],
  },
};

// this is my default function that will send a GET request to /reviews/ for product 100
export default function () {
  /**
   * Running the following command:
   * db.reviews.aggregate([
   *   {$group: {_id: "$product_id", count: {$count:{}}}},
   *   {$group:{_id: null, count: {$count:{}}}}
   * ])
   *
   * Returns the following, which is a count of the total number of different product_ids
   * [ { _id: null, count: 950072 } ]
   *
   * Then running the following command
   * (looking for the first 100 items in the lowest 10% of product_ids):
   * db.reviews.aggregate([
   *   {$group: {_id: "$product_id"}},
   *   {$project: {_id: {$toInt: '$_id'}}},
   *   {$match:{'_id':{$lt: 95007}}},
   *   {$sort:{_id: 1}},
   *   {$limit: 100},
   *   {$group:{_id: '_id', values: {$push: '$_id'}}}
   * ])
   *
   * Returns the following, which can be used to query the first 10% of product_ids:
   * [{_id: '_id', values: [1, 2, 4, 5, 7, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
   *   26, 27, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
   *   50, 51, 52, 53, 54, 55, 56, 57, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 74,
   *   75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 94, 95, 96, 97, 98,
   *   99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110]}]
   *
   * Then similarly, to get the first 100 items in the middle 10% of the product_ids
   * the following command can be run (where the $gt value is 0.5 * 950072 = 475036):
   * db.reviews.aggregate([
   *   {$group: {_id: "$product_id"}},
   *   {$project: {_id: {$toInt: '$_id'}}},
   *   {$match:{'_id':{$gt: 475036}}},
   *   {$sort:{_id: 1}},
   *   {$limit: 100},
   *   {$group:{_id: '_id', values: {$push: '$_id'}}}
   * ])
   *
   * This results in the following array
   * [475037, 475038, 475039, 475040, 475041, 475043, 475044, 475045, 475046, 475047, 475048,
   * 475049, 475050, 475051, 475052, 475053, 475054, 475055, 475056, 475057, 475058, 475059,
   * 475060, 475061, 475062, 475063, 475064, 475065, 475066, 475067, 475068, 475069, 475070,
   * 475071, 475072, 475073, 475074, 475075, 475076, 475077, 475078, 475079, 475080, 475081,
   * 475082, 475083, 475084, 475085, 475086, 475087, 475088, 475090, 475091, 475092, 475093,
   * 475094, 475095, 475097, 475098, 475099, 475100, 475101, 475102, 475103, 475104, 475105,
   * 475107, 475108, 475109, 475110, 475111, 475112, 475113, 475114, 475116, 475117, 475118,
   * 475119, 475120, 475121, 475122, 475123, 475124, 475125, 475126, 475127, 475130, 475132,
   * 475133, 475134, 475135, 475136, 475137, 475139, 475140, 475141, 475142, 475143, 475144,
   * 475145]
   *
   *
   * Then similarly, to get the first 100 items in the last 10% of the product_ids
   * the following command can be run (where the $gt value is 0.9 * 950072 = 855064):
   * db.reviews.aggregate([
   *   {$group: {_id: "$product_id"}},
   *   {$project: {_id: {$toInt: '$_id'}}},
   *   {$match:{'_id':{$gt: 855064}}},
   *   {$sort:{_id: 1}},
   *   {$limit: 100},
   *   {$group:{_id: '_id', values: {$push: '$_id'}}}
   * ])
   *
   * This results in the following array:
   * [855065, 855066, 855067, 855068, 855069, 855070, 855071, 855072, 855073, 855074, 855075,
   * 855076, 855077, 855078, 855079, 855080, 855081, 855082, 855083, 855084, 855085, 855086,
   * 855087, 855088, 855089, 855090, 855091, 855092, 855093, 855094, 855095, 855096, 855097,
   * 855098, 855099, 855100, 855101, 855102, 855103, 855104, 855105, 855106, 855107, 855108,
   * 855109, 855110, 855111, 855112, 855113, 855114, 855115, 855116, 855117, 855119, 855120,
   * 855121, 855122, 855123, 855124, 855125, 855126, 855127, 855128, 855130, 855131, 855132,
   * 855134, 855135, 855136, 855137, 855139, 855140, 855141, 855142, 855143, 855144, 855145,
   * 855146, 855147, 855148, 855149, 855150, 855151, 855153, 855154, 855155, 855156, 855157,
   * 855158, 855159, 855160, 855161, 855162, 855163, 855164, 855165, 855166, 855167, 855168,
   * 855169]
   */

  // set from the above query
  const first = [1, 2, 4, 5, 7, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
    28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
    52, 53, 54, 55, 56, 57, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 74, 75, 76,
    77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 94, 95, 96, 97, 98, 99, 100,
    101, 102, 103, 104, 105, 106, 107, 108, 109, 110];

  const middle = [475037, 475038, 475039, 475040, 475041, 475043, 475044, 475045, 475046, 475047,
    475048, 475049, 475050, 475051, 475052, 475053, 475054, 475055, 475056, 475057, 475058, 475059,
    475060, 475061, 475062, 475063, 475064, 475065, 475066, 475067, 475068, 475069, 475070, 475071,
    475072, 475073, 475074, 475075, 475076, 475077, 475078, 475079, 475080, 475081, 475082, 475083,
    475084, 475085, 475086, 475087, 475088, 475090, 475091, 475092, 475093, 475094, 475095, 475097,
    475098, 475099, 475100, 475101, 475102, 475103, 475104, 475105, 475107, 475108, 475109, 475110,
    475111, 475112, 475113, 475114, 475116, 475117, 475118, 475119, 475120, 475121, 475122, 475123,
    475124, 475125, 475126, 475127, 475130, 475132, 475133, 475134, 475135, 475136, 475137, 475139,
    475140, 475141, 475142, 475143, 475144, 475145];

  const last = [855065, 855066, 855067, 855068, 855069, 855070, 855071, 855072, 855073, 855074,
    855075, 855076, 855077, 855078, 855079, 855080, 855081, 855082, 855083, 855084, 855085, 855086,
    855087, 855088, 855089, 855090, 855091, 855092, 855093, 855094, 855095, 855096, 855097,
    855098, 855099, 855100, 855101, 855102, 855103, 855104, 855105, 855106, 855107, 855108,
    855109, 855110, 855111, 855112, 855113, 855114, 855115, 855116, 855117, 855119, 855120,
    855121, 855122, 855123, 855124, 855125, 855126, 855127, 855128, 855130, 855131, 855132,
    855134, 855135, 855136, 855137, 855139, 855140, 855141, 855142, 855143, 855144, 855145,
    855146, 855147, 855148, 855149, 855150, 855151, 855153, 855154, 855155, 855156, 855157,
    855158, 855159, 855160, 855161, 855162, 855163, 855164, 855165, 855166, 855167, 855168,
    855169];

  const checkingObj = {
    // checking each request to ensure the status is 204
    'response has a status of 204': (r) => r.status === 204,
    // checking each request to ensure that the response time is less than 200ms
    'transaction time < 200ms': (r) => r.timings.duration < 200,
    // checking each request to ensure that the response time is less than 100ms
    'transaction time < 100ms': (r) => r.timings.duration < 100,
    // checking each request to ensure that the response time is less than 50ms
    'transaction time < 50ms': (r) => r.timings.duration < 50,
  };

  group('PUT /reviews/ within the first 10%', () => {
    const productId = first[Math.floor(Math.random() * first.length)];
    const res = http.put(`http://localhost:8080/reviews/${productId}/helpful`);
    check(res, checkingObj);
  });
  group('PUT /reviews/ within the middle 10%', () => {
    const productId = middle[Math.floor(Math.random() * middle.length)];
    const res = http.put(`http://localhost:8080/reviews/${productId}/helpful`);
    check(res, checkingObj);
  });
  group('PUT /reviews/ within the last 10%', () => {
    const productId = last[Math.floor(Math.random() * last.length)];
    const res = http.put(`http://localhost:8080/reviews/${productId}/helpful`);
    check(res, checkingObj);
  });
}
