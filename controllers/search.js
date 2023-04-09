const { response } = require('express');
const { StatusCodes } = require('http-status-codes');
const { ObjectId } = require('mongoose').Types;
const { winstonLogger, ProblemDetails } = require('../utils');
const { User, Product, Category } = require('../models');

const collectionsAllowed = ['users', 'categories', 'products', 'roles'];

/**
 * Search users by term
 * @param {*} term
 * @param {*} res
 * @returns
 */
const searchUsers = async (term = '', res = response) => {
  const isMongoId = ObjectId.isValid(term);

  if (isMongoId) {
    const user = await User.findById(term);
    return res
      .status(user ? StatusCodes.OK : StatusCodes.NOT_FOUND)
      .json({ results: user ? [user] : [] });
  }

  const regex = new RegExp(term, 'i');

  const users = await User.find({
    $or: [{ name: regex }, { email: regex }],
    $and: [{ state: true }],
  });

  if (users === null || users === {}) {
    const msg = `There is no user that matches with ${term}`;
    winstonLogger.info(msg);
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ results: [] });
  }

  return res
    .status(StatusCodes.OK)
    .json({ results: users });
};

/**
 * Search categories by term
 * @param {*} term
 * @param {*} res
 * @returns
 */
const searchCategories = async (term = '', res = response) => {
  const isMongoId = ObjectId.isValid(term);

  if (isMongoId) {
    const category = await Category.findById(term);
    return res
      .status(category ? StatusCodes.OK : StatusCodes.NOT_FOUND)
      .json({ results: category ? [category] : [] });
  }

  const regex = new RegExp(term, 'i');

  const categories = await Category.find({
    name: regex,
    $and: [{ state: true }],
  });

  if (categories === null || categories === {}) {
    const msg = `There is no category that matches with ${term}`;
    winstonLogger.info(msg);
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ results: [] });
  }

  return res
    .status(StatusCodes.OK)
    .json({ results: categories });
};

/**
 * Search products by term
 * @param {*} term
 * @param {*} res
 * @returns
 */
const searchProducts = async (term = '', res = response) => {
  const isMongoId = ObjectId.isValid(term);

  if (isMongoId) {
    const product = await Product.findById(term).populate('categoryId', 'name');
    return res
      .status(product ? StatusCodes.OK : StatusCodes.NOT_FOUND)
      .json({ results: product ? [product] : [] });
  }

  const regex = new RegExp(term, 'i');

  const products = await Product.find({
    $or: [{ name: regex }, { description: regex }],
    $and: [{ state: true }],
  }).populate('categoryId', 'name');

  if (products === null || products === {}) {
    const msg = `There is no product that matches with ${term}`;
    winstonLogger.info(msg);
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ results: [] });
  }

  return res
    .status(StatusCodes.OK)
    .json({ results: products });
};

/**
 * Search in allowed collections
 * @param {*} req
 * @param {*} res
 * @returns
 */
const search = async (req, res = response) => {
  const { collection, term } = req.params;

  if (!collectionsAllowed.includes(collection)) {
    const msg = `The collections allowed are ${collectionsAllowed}`;
    winstonLogger.warn(msg);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .set('Content-Type', 'application/problem+json')
      .json(ProblemDetails.create(
        'Some parameters are invalid.',
        msg,
        'https://example.com/collections/id-not-found',
        req.originalUrl,
        StatusCodes.BAD_REQUEST,
      ));
  }

  switch (collection) {
    case 'users':
      await searchUsers(term, res);
      break;
    case 'categories':
      await searchCategories(term, res);
      break;
    case 'products':
      await searchProducts(term, res);
      break;

    default:
      winstonLogger.warn(`Ups! Search for ${collection} not implemented yet`);
      return res
        .status(StatusCodes.NOT_IMPLEMENTED)
        .set('Content-Type', 'application/problem+json')
        .json(ProblemDetails.create(
          'Some parameters are invalid.',
          `Ups! Search for ${collection} not implemented yet`,
          'https://example.com/collections/not-implemented',
          req.originalUrl,
          StatusCodes.NOT_IMPLEMENTED,
        ));
  }

  return 0;
};

module.exports = {
  search,
};
