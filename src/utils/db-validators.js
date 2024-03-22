const { ObjectId } = require('mongoose').Types;
const {
  User, Role, Category, Product,
} = require('../models');
const winstonLogger = require('./winston-logger');

const isValidMongoId = (id) => {
  if (id.length > 12 && id.length >= 24) {
    return new ObjectId(id).toString() === id;
  }
  return false;
};

const collectionsAllowed = (collection = '', collections = []) => {
  const check = collections.includes(collection);

  if (!check) {
    const msg = `The ${collection} collection is not allowed: ${collections}`;
    winstonLogger.error(msg);
    throw new Error(
      msg,
    );
  }
  return true;
};

const isRoleValid = async (role = '') => {
  const roleExists = await Role.findOne({ role });

  if (!roleExists) {
    const msg = `Role ${role} not found`;
    winstonLogger.error(msg);
    throw new Error(msg);
  }

  return true;
};

const emailExists = async (email = '') => {
  // check if mail exists
  const checkEmail = await User.findOne({ email });

  if (checkEmail) {
    const msg = `Mail ${email} already registered`;
    winstonLogger.error(msg);
    throw new Error(msg);
  }

  return true;
};

const categoryExists = async (id = '') => {
  if (isValidMongoId(id)) {
    const checkId = await Category.findById(id);

    if (!checkId) {
      const msg = `Category ID ${id} is not registered`;
      winstonLogger.error(msg);
      return false;
    }

    return true;
  }

  winstonLogger.error(`The ID ${id} id not valid`);
  return false;
};

const productExists = async (id = '') => {
  if (!isValidMongoId(id)) {
    return false;
  }

  const checkId = await Product.findById(id);

  if (!checkId) {
    const msg = `Product ID ${id} is not registered`;
    winstonLogger.error(msg);
    throw new Error(msg);
  }

  return true;
};

const userIdExists = async (id = '') => {
  if (!isValidMongoId(id)) {
    return false;
  }

  const checkId = await User.findById(id);

  if (!checkId) {
    const msg = `ID ${id} is not registered`;
    winstonLogger.error(msg);
    throw new Error(msg);
  }

  return true;
};

module.exports = {
  isRoleValid,
  emailExists,
  userIdExists,
  categoryExists,
  productExists,
  collectionsAllowed,
};
