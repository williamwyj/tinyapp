const { assert } = require('chai');

const { findUserEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID" : {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput)
  })
  it('should return a user object when provided valid email', function() {
    const user = findUserEmail("user@example.com", testUsers)
    const expectedOutput = testUsers.userRandomID
    assert.deepEqual(user, expectedOutput)
  })
  it('should return undefined if input non-existent email', function() {
    const user = findUserEmail("invalid@email.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput)
  })
})