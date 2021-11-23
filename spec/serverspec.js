import {expect, assert} from 'chai';
import axios from 'axios';
describe('REST API tests', () => {
  describe('Express server GET request for /reviews/ route tests', () => {
    it('should answer GET requests for /reviews/ with correct data types', async () => {
      const productId = '100';
      const response = await axios.get(`http://localhost:8080/reviews/?product_id=${productId}`);

      expect(response.status).to.equal(200);
      expect(response.data.product_id).to.equal(productId);
      expect(response.data.product_id).to.be.a('string');
      expect(response.data.page).to.be.a('number');
      expect(response.data.count).to.be.a('number');
      expect(response.data.results).to.be.a('array');
      expect(response.data.results[0].review_id).to.be.a('number');
      expect(response.data.results[0].rating).to.be.a('number');
      expect(response.data.results[0].summary).to.be.a('string');
      expect(response.data.results[0].recommend).to.be.a('boolean');
      expect(response.data.results[0].response).to.be.a('string');
      expect(response.data.results[0].body).to.be.a('string');
      expect(response.data.results[0].date).to.be.a('string');
      expect(response.data.results[0].reviewer_name).to.be.a('string');
      expect(response.data.results[0].helpfulness).to.be.a('number');
      expect(response.data.results[0].photos).to.be.a('array');
      expect(response.data.results[0].photos[0].id).to.be.a('number');
      expect(response.data.results[0].photos[0].url).to.be.a('string');
    });
    it('should answer GET requests for /reviews/ with right count parameters', async () => {
      const productId = '1';
      const count = 3;
      const response = await axios.get(`http://localhost:8080/reviews/?product_id=${productId}&count=${count}`);

      expect(response.status).to.equal(200);
      expect(response.data.product_id).to.equal(productId);
      expect(response.data.count).to.be.below(count + 1);
    });
    it('should answer GET requests for /reviews/ with right sorting results', async () => {
      const productId = '100';
      const sort = 'helpful';
      const response = await axios.get(`http://localhost:8080/reviews/?product_id=${productId}&sort=${sort}`);

      expect(response.status).to.equal(200);
      expect(response.data.product_id).to.equal(productId);

      // get helpful values into an array and ensure that the length is greater than 1
      // so that deep equality assertion makes sense
      let helpful = response.data.results.map(item => item.helpfulness);
      expect(helpful).to.have.lengthOf.above(1);

      assert.deepEqual(helpful.sort((a, b) => (b - a)),helpful);
    });
    it('should answer GET requests for /reviews/ with right count and page parameters', async () => {
      const productId = 100; // product 100 has >5 results for reviews
      const count = 2;
      const page = 2;
      // run request with no page parameter and count that includes both pages
      const noPageResponse = await axios.get(`http://localhost:8080/reviews/?product_id=${productId}&count=${count * page}`);
      expect(noPageResponse.status).to.equal(200);

      // run request with a page paramater
      const pageResponse = await axios.get(`http://localhost:8080/reviews/?product_id=${productId}&count=${count}&page=${page}`);
      expect(pageResponse.status).to.equal(200);

      /*
        check that the last 2 results of the response from the request without
        a page parameter are deeply equal to all the results of the response
        from the request with a page parameter
      */
      expect(noPageResponse.data.results.slice(2)).to.deep.equal(pageResponse.data.results);
    });
  });
  describe('Express server GET request for /reviews/meta route tests', () => {
    it('should answer GET requests for /reviews/meta/ with correct data types', async () => {
      const productId = `${Math.floor(Math.random() * 1000000)}`;
      const response = await axios.get(`http://localhost:8080/reviews/meta/?product_id=${productId}`);

      expect(response.status).to.equal(200);
      expect(response.data.product_id).to.equal(productId);
      expect(response.data.product_id).to.be.a('string');
      expect(response.data.ratings).to.be.a('object');

      expect(Object.keys(response.data.ratings)).to.have.lengthOf(5);

      Object.values(response.data.ratings).forEach(item => {
        expect(item).to.be.a('number');
      });

      expect(response.data.recommended).to.be.a('object');
      expect(response.data.recommended.true).to.be.a('number');
      expect(response.data.recommended.false).to.be.a('number');

      expect(response.data.characteristics).to.be.a('object');

      Object.values(response.data.characteristics).forEach(item => {
        expect(item).to.be.a('object');
        expect(item.id).to.be.a('number');
        expect(item.value).to.be.a('string');
      });
    });
  });
  describe('Express server POST request for /reviews/ route tests', () => {
    it('fields inserted should be found on the database', async () => {
      const postObj = {
        product_id: '100',
        rating: 2,
        summary: 'This is a test',
        body: 'This is just a test post to see if the route is working',
        recommend: true,
        name: 'mike tester',
        email: 'mike@check.test',
        photos: [
          'mic.check/1',
          'mic.check/2',
          'mic.check/3',
          'mic.check/4',
          'mic.check/5',
          'mic.check/6'
        ],
        characteristics: {
          '343': 3
        }
      };

      const postResponse = await axios.post('http://localhost:8080/reviews/', postObj);

      expect(postResponse.status).to.equal(201);

      const reviewGETURL = `http://localhost:8080/reviews/?product_id=${postObj.product_id}&sort=newest`;

      const reviewResponse = await axios.get(reviewGETURL);

      expect(reviewResponse.status).to.equal(200);
      expect(reviewResponse.data.product_id).to.equal(postObj.product_id);

      expect(reviewResponse.data.results).to.have.lengthOf(5);
      expect(reviewResponse.data.results[0].rating).to.equal(postObj.rating);
      expect(reviewResponse.data.results[0].summary).to.equal(postObj.summary);
      expect(reviewResponse.data.results[0].recommend).to.equal(postObj.recommend);
      expect(reviewResponse.data.results[0].response).to.not.equal(undefined);
      expect(reviewResponse.data.results[0].body).to.equal(postObj.body);
      expect(reviewResponse.data.results[0].date).to.not.equal(undefined);
      expect(reviewResponse.data.results[0].reviewer_name).to.equal(postObj.name);
      expect(reviewResponse.data.results[0].helpfulness).to.equal(0);
      expect(reviewResponse.data.results[0].photos).to.have.lengthOf(5);
      expect(reviewResponse.data.results[0].photos[0].id).to.not.equal(undefined);
      // since the photos are being written/read asynchronously just check that the string up to the number matches
      expect(reviewResponse.data.results[0].photos[0].url.slice(0, -1)).to.equal(postObj.photos[0].slice(0, -1));
    });
  })
})

