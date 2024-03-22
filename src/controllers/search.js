const { response } = require('express');
const { StatusCodes } = require('http-status-codes');
const { winstonLogger, ProblemDetails } = require('../utils');
const {
  usersService,
  productsService,
  categoriesService,
  rolesService,
} = require('../services');

const collectionsAllowed = ['users', 'categories', 'products', 'roles'];

/**
 * Search users by term
 * @param {*} term
 * @param {*} res
 * @returns
 */
const searchUsers = async (term = '', res = response) => {
  const users = await usersService.search(term);

  if (users === null || users.length === 0) {
    const msg = `There is no user that matches with ${term}`;
    winstonLogger.info(msg);
    return res.status(StatusCodes.NOT_FOUND).json({ results: [] });
  }

  return res.status(StatusCodes.OK).json({ results: users });
};

/**
 * Search roles by term
 * @param {*} term
 * @param {*} res
 * @returns
 */
const searchRoles = async (term = '', res = response) => {
  const roles = await rolesService.search(term);

  if (roles === null || roles.length === 0) {
    const msg = `There is no role that matches with ${term}`;
    winstonLogger.info(msg);
    return res.status(StatusCodes.NOT_FOUND).json({ results: [] });
  }

  return res.status(StatusCodes.OK).json({ results: roles });
};

/**
 * Search categories by term
 * @param {*} term
 * @param {*} res
 * @returns
 */
const searchCategories = async (term = '', res = response) => {
  const categories = await categoriesService.search(term);

  if (categories === null || categories.length === 0) {
    const msg = `There is no category that matches with ${term}`;
    winstonLogger.info(msg);
    return res.status(StatusCodes.NOT_FOUND).json({ results: [] });
  }

  return res.status(StatusCodes.OK).json({ results: categories });
};

/**
 * Search products by term
 * @param {*} term
 * @param {*} res
 * @returns
 */
const searchProducts = async (term = '', res = response) => {
  const products = await productsService.search(term);

  if (products === null || products.length === 0) {
    const msg = `There is no product that matches with ${term}`;
    winstonLogger.info(msg);
    return res.status(StatusCodes.NOT_FOUND).json({ results: [] });
  }

  return res.status(StatusCodes.OK).json({ results: products });
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
      .json(
        ProblemDetails.create(
          'Some parameters are invalid.',
          msg,
          'https://example.com/collections/id-not-found',
          req.originalUrl,
          StatusCodes.BAD_REQUEST
        )
      );
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
    case 'roles':
      await searchRoles(term, res);
      break;
    default:
      winstonLogger.warn(`Ups! Search for ${collection} not implemented yet`);
      return res
        .status(StatusCodes.NOT_IMPLEMENTED)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'Some parameters are invalid.',
            `Ups! Search for ${collection} not implemented yet`,
            'https://example.com/collections/not-implemented',
            req.originalUrl,
            StatusCodes.NOT_IMPLEMENTED
          )
        );
  }

  return 0;
};

module.exports = {
  search,
};
