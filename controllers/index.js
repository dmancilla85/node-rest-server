const { login, googleSignIn } = require("./auth");
const {
  getCategories,
  getCategoryById,
  putCategories,
  postCategories,
  deleteCategories,
  patchCategories
} = require("./categories");
const {
  getProducts,
  getProductById,
  putProducts,
  postProducts,
  deleteProducts,
  patchProducts
} = require("./products");
const { search } = require("./search");
const {
  getUsers,
  putUsers,
  postUsers,
  deleteUsers,
  patchUsers
} = require("./users");

module.exports = {
  search,
  login,
  googleSignIn,
  getProducts,
  getProductById,
  putProducts,
  postProducts,
  deleteProducts,
  patchProducts,
  getUsers,
  putUsers,
  postUsers,
  deleteUsers,
  patchUsers,
  getCategories,
  getCategoryById,
  putCategories,
  postCategories,
  deleteCategories,
  patchCategories
};
