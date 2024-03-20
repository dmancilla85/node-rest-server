const categoriesService = require('./categories.service');
const productsService = require('./products.service');
const rolesService = require('./roles.service');
const usersService = require('./users.service');
const authService = require('./auth.service');
const cloudinaryService = require('./cloudinary.service');
const gridFsService = require('./gridfs.service');

module.exports = {
  categoriesService,
  productsService,
  rolesService,
  usersService,
  authService,
  cloudinaryService,
  gridFsService,
};
