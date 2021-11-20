import {expect, assert} from 'chai';
import axios from 'axios';

describe('Express server GET request for /reviews/ route test', () => {
  it('should answer GET requests for /reviews/ with right count parameters', () => {
    const productId = 1;
    const count = 3;
    axios.get(`http://localhost:8080/reviews/?product_id=${productId}&count=${count}`)
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.data.product_id).to.equal(String(productId));
        expect(response.data.count).to.be.below(count + 1);
      })
      .catch(console.log);
  });
  it('should answer GET requests for /reviews/ with right sorting results', () => {
    const productId = 100;
    const sort = 'helpful';
    axios.get(`http://localhost:8080/reviews/?product_id=${productId}&sort=${sort}`)
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.data.product_id).to.equal(String(productId));

        // get helpful values into an array and ensure that the length is greater than 1
        // so that deep equality assertion makes sense
        let helpful = response.data.results.map(item => item.helpfulness);
        expect(helpful).to.have.lengthOf.above(1);

        assert.deepEqual(helpful.sort((a, b) => (b - a)),helpful);
      })
      .catch(console.log);
  });
  it('should answer GET requests for /reviews/ with right count and page parameters', () => {
    const productId = 100; // product 100 has >5 results for reviews
    const count = 2;
    const page = 2;
    // run request with no page parameter and count that includes both pages
    axios.get(`http://localhost:8080/reviews/?product_id=${productId}&count=${count * page}`)
      .then(noPageResponse => {
        expect(noPageResponse.status).to.equal(200);

        // run request with a page paramater
        axios.get(`http://localhost:8080/reviews/?product_id=${productId}&count=${count}&page=${page}`)
          .then((pageResponse) => {
            expect(pageResponse.status).to.equal(200);

            /*
              check that the last 2 results of the response from the request without
              a page parameter are deeply equal to all the results of the response
              from the request with a page parameter
            */
            expect(noPageResponse.data.results.slice(2)).to.deep.equal(pageResponse.data.results);
          })
          .catch(console.log);
      })
      .catch(console.log);
  });
});
