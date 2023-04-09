const auth = require('./auth');
const categories = require('./categories');
const products = require('./products');
const search = require('./search');
const users = require('./users');
const uploads = require('./uploads');
const uploadsToMongo = require('./uploads-to-mongo');

module.exports = {
  ...auth,
  ...categories,
  ...products,
  ...search,
  ...users,
  ...uploads,
  ...uploadsToMongo,
};
