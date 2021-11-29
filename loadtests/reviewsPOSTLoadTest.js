/* eslint-disable import/no-unresolved */
import http from 'k6/http';
import { check, group } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.005'], // http errors should be less than 0.5%
    http_req_duration: [
      'p(99)<2000', // 99% of requests should be below 2000ms
      'p(97)<1500', // 97% of requests should be below 1500ms
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
   * The above is similar to the reviews command to get the total number of product ids.
   * Then running the following command
   * (looking for the first 40 items in the lowest 5% of product_ids)
   * db.characteristics.aggregate([
   *   {$project: {_id: 1, product_id: {$toInt: "$product_id"}}},
   *   {$match: {'product_id': {$lt: 47504}}},
   *   {$group: {_id: '$product_id',chars: {$push: "$_id"}}},
   *   {$project: {_id: 0, product_id: '$_id', chars: 1}},
   *   {$limit: 40}
   * ])
   *
   * This will return an array of objects that hold characteristics and product_ids that match
   *
   * The same can be done to generate the middle 5% (> 950072*0.5) and last 5% (> 950072*0.95)
   *
   */

  // set from the above query
  const first = [
    { chars: [131116], product_id: 39190 },
    { chars: [23215, 23216, 23217, 23218], product_id: 6976 },
    { chars: [19370, 19371, 19372, 19373], product_id: 5828 },
    { chars: [63802], product_id: 19075 },
    { chars: [15624, 15625, 15627, 15626], product_id: 4680 },
    { chars: [79218], product_id: 23667 },
    { chars: [12745, 12747, 12746, 12748], product_id: 3814 },
    { chars: [113544, 113545, 113546, 113547], product_id: 33915 },
    { chars: [116784, 116783, 116785, 116786], product_id: 34892 },
    { chars: [134404, 134405, 134406, 134407], product_id: 40171 },
    { chars: [97834, 97833, 97836, 97835], product_id: 29238 },
    { chars: [10842, 10839, 10840, 10841], product_id: 3240 },
    { chars: [82495, 82496, 82497, 82498], product_id: 24646 },
    { chars: [8909, 8910, 8911, 8912], product_id: 2666 },
    { chars: [147417], product_id: 44076 },
    { chars: [7000, 6998, 6997, 6999], product_id: 2092 },
    { chars: [5962, 5963, 5964, 5965], product_id: 1783 },
    { chars: [67076, 67073, 67075, 67074], product_id: 20054 },
    { chars: [5003, 5004, 5005, 5006], product_id: 1496 },
    { chars: [53255, 53256, 53257, 53258], product_id: 15923 },
    { chars: [45502, 45503, 45504, 45505], product_id: 13627 },
    { chars: [120042, 120043, 120044, 120041], product_id: 35873 },
    { chars: [37818], product_id: 11331 },
    { chars: [4041], product_id: 1209 },
    { chars: [30173, 30175, 30174, 30176], product_id: 9035 },
    { chars: [3250, 3251, 3253, 3252], product_id: 973 },
    { chars: [85769, 85770, 85771, 85772], product_id: 25625 },
    { chars: [101078, 101079, 101080, 101077], product_id: 30217 },
    { chars: [2303, 2304, 2305, 2306], product_id: 686 },
    { chars: [123268, 123269, 123270, 123271], product_id: 36850 },
    { chars: [126553, 126550, 126552, 126551], product_id: 37831 },
    { chars: [70350, 70351, 70352, 70353], product_id: 21033 },
    { chars: [150708, 150709, 150710, 150711], product_id: 45057 },
    { chars: [55012, 55013, 55014, 55015], product_id: 16441 },
    { chars: [153962], product_id: 46034 },
    { chars: [157232, 157233, 157234, 157235], product_id: 47015 },
    { chars: [129846, 129847, 129848, 129849], product_id: 38808 },
    { chars: [104427, 104426, 104428, 104429], product_id: 31196 },
    { chars: [1075, 1074, 1076, 1077], product_id: 312 },
    { chars: [89040, 89041, 89042, 89043], product_id: 26604 },
  ];

  const middle = [
    { chars: [2757502, 2757503, 2757504, 2757505], product_id: 823666 },
    { chars: [2811106, 2811107, 2811108, 2811109], product_id: 839695 },
    { chars: [1655335, 1655336, 1655337, 1655338], product_id: 494584 },
    { chars: [1708859, 1708860, 1708861, 1708862], product_id: 510611 },
    { chars: [2864931], product_id: 855720 },
    { chars: [2596121], product_id: 775523 },
    { chars: [2649895, 2649896, 2649897, 2649898], product_id: 791548 },
    { chars: [2703815, 2703816, 2703817, 2703818], product_id: 807641 },
    { chars: [1601836, 1601837, 1601838, 1601839], product_id: 478525 },
    { chars: [3079496, 3079497, 3079498, 3079499], product_id: 919892 },
    { chars: [1824668, 1824669, 1824670, 1824671], product_id: 545081 },
    { chars: [1878235, 1878236, 1878237, 1878238], product_id: 561106 },
    { chars: [3132920], product_id: 935921 },
    { chars: [3186736], product_id: 951946 },
    { chars: [1932110, 1932109, 1932111, 1932112], product_id: 577135 },
    { chars: [2918124, 2918125, 2918126, 2918127], product_id: 871749 },
    { chars: [1770619, 1770620, 1770621, 1770622], product_id: 528988 },
    { chars: [2971724], product_id: 887774 },
    { chars: [3025367, 3025368, 3025369, 3025370], product_id: 903803 },
    { chars: [2146808], product_id: 641243 },
    { chars: [2200601, 2200604, 2200602, 2200603], product_id: 657332 },
    { chars: [2254313, 2254314, 2254316, 2254315], product_id: 673361 },
    { chars: [1985844, 1985845, 1985847, 1985846], product_id: 593160 },
    { chars: [2039527, 2039528, 2039529, 2039526], product_id: 609189 },
    { chars: [3240388, 3240389, 3240390, 3240391], product_id: 967975 },
    { chars: [3294193, 3294194, 3294195, 3294192], product_id: 984000 },
    { chars: [2093195, 2093197, 2093196, 2093198], product_id: 625214 },
    { chars: [2469042], product_id: 737469 },
    { chars: [2522751], product_id: 753558 },
    { chars: [2307789, 2307788, 2307787, 2307790], product_id: 689386 },
    { chars: [2361558, 2361557, 2361559, 2361556], product_id: 705415 },
    { chars: [2415275, 2415273, 2415274, 2415276], product_id: 721440 },
    { chars: [2737408, 2737409, 2737410, 2737411], product_id: 817666 },
    { chars: [2791018, 2791019, 2791020, 2791021], product_id: 833695 },
    { chars: [1645273, 1645275, 1645274, 1645276], product_id: 491584 },
    { chars: [2845090, 2845091, 2845092, 2845093], product_id: 849784 },
    { chars: [2576317, 2576318, 2576316, 2576319], product_id: 769587 },
    { chars: [2629904, 2629905, 2629906, 2629907], product_id: 785612 },
    { chars: [1591825, 1591826, 1591824, 1591827], product_id: 475557 },
    { chars: [2683820, 2683822, 2683821, 2683823], product_id: 801641 },
  ];

  const last = [
    { chars: [3160781, 3160782, 3160779, 3160780], product_id: 944268 },
    { chars: [3248993, 3248991, 3248990, 3248992], product_id: 970550 },
    { chars: [3050955, 3050956, 3050957, 3050958], product_id: 911424 },
    { chars: [3214509, 3214512, 3214510, 3214511], product_id: 960297 },
    { chars: [3302897], product_id: 986579 },
    { chars: [3324822, 3324820, 3324819, 3324821], product_id: 993141 },
    { chars: [3104620, 3104622, 3104621, 3104619], product_id: 927453 },
    { chars: [3158362, 3158361, 3158363, 3158364], product_id: 943542 },
    { chars: [3268410, 3268409, 3268412, 3268411], product_id: 976322 },
    { chars: [3048531, 3048534, 3048533, 3048532], product_id: 910698 },
    { chars: [3212157, 3212158, 3212159, 3212160], product_id: 959571 },
    { chars: [3322220], product_id: 992351 },
    { chars: [3102204, 3102205, 3102207, 3102206], product_id: 926727 },
    { chars: [3155744, 3155745, 3155746, 3155747], product_id: 942752 },
    { chars: [3266002, 3266001, 3266003, 3266000], product_id: 975596 },
    { chars: [3046116, 3046117, 3046118, 3046119], product_id: 909972 },
    { chars: [3209504, 3209501, 3209502, 3209503], product_id: 958781 },
    { chars: [3319817, 3319819, 3319818, 3319820], product_id: 991625 },
    { chars: [3099777, 3099778, 3099779, 3099780], product_id: 926001 },
    { chars: [3153301, 3153299, 3153300, 3153302], product_id: 942026 },
    { chars: [3263552, 3263554, 3263553, 3263555], product_id: 974870 },
    { chars: [3043440, 3043441, 3043442, 3043439], product_id: 909182 },
    { chars: [3317348], product_id: 990899 },
    { chars: [3207074, 3207075, 3207076, 3207077], product_id: 958055 },
    { chars: [3097104, 3097106, 3097105, 3097103], product_id: 925211 },
    { chars: [3260936, 3260935, 3260938, 3260937], product_id: 974080 },
    { chars: [3170802, 3170800, 3170801, 3170803], product_id: 947236 },
    { chars: [3061261, 3061262, 3061259, 3061260], product_id: 914456 },
    { chars: [3224494], product_id: 963265 },
    { chars: [3334647, 3334648, 3334645, 3334646], product_id: 996109 },
    { chars: [3114857, 3114858, 3114859, 3114860], product_id: 930485 },
    { chars: [3278472, 3278473, 3278474, 3278475], product_id: 979290 },
    { chars: [3168331, 3168332, 3168333, 3168334], product_id: 946510 },
    { chars: [3058502, 3058501, 3058503, 3058504], product_id: 913666 },
    { chars: [3222070], product_id: 962539 },
    { chars: [3332206, 3332207, 3332208, 3332209], product_id: 995383 },
    { chars: [3112192], product_id: 929695 },
    { chars: [3276016, 3276017, 3276018, 3276015], product_id: 978564 },
    { chars: [3165850, 3165851, 3165852, 3165853], product_id: 945784 },
    { chars: [3056053], product_id: 912940 },
  ];

  const checkingObj = {
    // checking each request to ensure the status is 201
    'response has a status of 201': (r) => r.status === 201,
    // checking each request to ensure that the response time is less than 2000ms
    'transaction time < 2000ms': (r) => r.timings.duration < 2000,
    // checking each request to ensure that the response time is less than 1500ms
    'transaction time < 1500ms': (r) => r.timings.duration < 1500,
  };

  const summaries = ['this stinks', 'this is eh', 'this is alright', 'this is good', 'this is great'];
  const bodies = [
    'this is the worst, do not buy',
    'I regret buying this but I will still use it',
    'I do not know if I would buy it again but it is ok',
    'I am glad I bought this thing',
    `This thing is so cool. Like the coolest.
    I am going to buy many many more.
    And I will tell everyone about it`,
  ];

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  group('GET /reviews/ within the first 10%', () => {
    // this calculation of random numbers and indexing from an array might make the tests slower?
    const index = Math.floor(Math.random() * first.length);
    const productId = first[index].product_id;
    const rating = Math.floor(Math.random() * 5) + 1;
    const characteristics = {};
    first[index].chars.forEach((item) => {
      characteristics[item] = rating;
    });

    const payload = {
      product_id: productId,
      rating,
      summary: summaries[rating - 1],
      body: bodies[rating - 1],
      recommend: true,
      name: 'mike tester',
      email: 'mike@check.test',
      photos: [
        'mic.check/001',
        'mic.check/002',
        'mic.check/003',
        'mic.check/004',
        'mic.check/005',
      ],
      characteristics,
    };

    const res = http.post('http://localhost:8080/reviews/', JSON.stringify(payload), params);
    if (res.status !== 201) {
      console.log(`reponse for ${productId} has a status of ${res.status}`);
    }
    check(res, checkingObj);
  });
  group('GET /reviews/ within the middle 10%', () => {
    // this calculation of random numbers and indexing from an array might make the tests slower?
    const index = Math.floor(Math.random() * middle.length);
    const productId = middle[index].product_id;
    const rating = Math.floor(Math.random() * 5) + 1;
    const characteristics = {};
    middle[index].chars.forEach((item) => {
      characteristics[item] = rating;
    });

    const payload = {
      product_id: productId,
      rating,
      summary: summaries[rating - 1],
      body: bodies[rating - 1],
      recommend: true,
      name: 'mike tester',
      email: 'mike@check.test',
      photos: [
        'mic.check/001',
        'mic.check/002',
        'mic.check/003',
        'mic.check/004',
        'mic.check/005',
      ],
      characteristics,
    };

    const res = http.post('http://localhost:8080/reviews/', JSON.stringify(payload), params);
    if (res.status !== 201) {
      console.log(`reponse for ${productId} has a status of ${res.status}`);
    }
    check(res, checkingObj);
  });
  group('GET /reviews/ within the last 10%', () => {
    // this calculation of random numbers and indexing from an array might make the tests slower?
    const index = Math.floor(Math.random() * last.length);
    const productId = last[index].product_id;
    const rating = Math.floor(Math.random() * 5) + 1;
    const characteristics = {};
    last[index].chars.forEach((item) => {
      characteristics[item] = rating;
    });

    const payload = {
      product_id: productId,
      rating,
      summary: summaries[rating - 1],
      body: bodies[rating - 1],
      recommend: true,
      name: 'mike tester',
      email: 'mike@check.test',
      photos: [
        'mic.check/001',
        'mic.check/002',
        'mic.check/003',
        'mic.check/004',
        'mic.check/005',
      ],
      characteristics,
    };

    const res = http.post('http://localhost:8080/reviews/', JSON.stringify(payload), params);
    if (res.status !== 201) {
      console.log(`reponse for ${productId} has a status of ${res.status}`);
    }
    check(res, checkingObj);
  });
}
