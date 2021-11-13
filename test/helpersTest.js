const { assert } = require('chai');

const { flatUrlDB, generateRandomString } = require('../helpers.js');

const testDB = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

describe('flatUrlDB', () => {
  it('should return a simple k-v pair DB', function() {
    const fUrlDB = flatUrlDB(testDB);
    const expectedDB = {b6UTxQ : "https://www.tsn.ca", i3BoGr: "https://www.google.ca",} 
    assert.deepEqual(fUrlDB, expectedDB);
  });
});

describe('generateRandomString', () => {
  it('should return a string of specified length', () => {
    const n = generateRandomString(6).length;
    assert.strictEqual(n, 6);
  });
});