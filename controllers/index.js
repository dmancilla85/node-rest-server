const auth = require("./auth");
const categories = require("./categories");
const products = require("./products");
const search = require("./search");
const users = require("./users");

module.exports = {
  ...auth,
  ...categories,
  ...products,
  ...search,
  ...users
};
