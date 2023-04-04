const { response, request } = require('express');
const { StatusCodes } = require('http-status-codes');
const { winstonLogger, ProblemDetails } = require('../helpers');
const { Category } = require('../models');

/**
 * Get all categories
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getCategories = async (req = request, res = response) => {
  const { limit = 5, from = 0 } = req.query;

  const query = { active: true };

  const [count, categories] = await Promise.all([
    Category.countDocuments(query),
    Category.find(query)
      .populate('userId', 'name')
      .skip(Number(from))
      .limit(Number(limit)),
  ]);

  if (count === 0) {
    const msg = 'There is no categories.';
    winstonLogger.warn(msg);
    return res
      .status(StatusCodes.NOT_FOUND)
      .set('Content-Type', 'application/problem+json')
      .json(ProblemDetails.create(
        'Empty collection',
        msg,
        'https://example.com/collections/empty',
        req.originalUrl,
        StatusCodes.NOT_FOUND,
      ));
  }

  return res.status(StatusCodes.OK)
    .json({
      count,
      categories,
    });
};

/**
 * Get category by ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getCategoryById = async (req = request, res = response) => {
  const { id } = req.params;
  const category = await Category.findById(id).populate('userId', 'name');

  if (category != null) {
    return res.status(StatusCodes.OK)
      .json(category);
  }

  const msg = `Category with ID ${id} not found`;
  winstonLogger.warn(msg);
  return res
    .status(StatusCodes.NOT_FOUND)
    .set('Content-Type', 'application/problem+json')
    .json(ProblemDetails.create(
      'Item not found',
      msg,
      'https://example.com/collections/id-not-found',
      req.originalUrl,
      StatusCodes.NOT_FOUND,
    ));
};

/**
 * Update categories by ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const putCategories = async (req, res = response) => {
  const { id } = req.params;

  const {
    _id, active, userId, ...data
  } = req.body;

  data.userId = req.authUser._id;
  data.name = data.name.toUpperCase();

  const categoryExists = await Category.findOne({ name: data.name });

  if (categoryExists) {
    const msg = `The category ${data.name} already exists`;
    winstonLogger.warn(msg);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .set('Content-Type', 'application/problem+json')
      .json(ProblemDetails.create(
        'Possible duplicated item',
        msg,
        'https://example.com/collections/duplicated-item',
        req.originalUrl,
        StatusCodes.NOT_FOUND,
      ));
  }

  const category = await Category.findByIdAndUpdate(id, data);

  if (category != null) {
    return res.status(StatusCodes.OK)
      .json(category);
  }

  const msg = `There is no category with ID ${id}`;
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
};

/**
 * Create new category
 * @param {*} req
 * @param {*} res
 * @returns
 */
const postCategories = async (req, res = response) => {
  const name = req.body.name.toUpperCase();

  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    const msg = `The category ${name} already exists`;
    winstonLogger.warn(msg);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .set('Content-Type', 'application/problem+json')
      .json(ProblemDetails.create(
        'Some parameters are invalid.',
        msg,
        'https://example.com/login/invalid-password',
        req.originalUrl,
        StatusCodes.BAD_REQUEST,
      ));
  }

  // data to save
  const data = {
    name,
    userId: req.authUser._id,
  };

  const category = new Category(data);

  // save to DB
  return category.save()
    .then((cat) => res.status(StatusCodes.CREATED)
      .json({ cat }))
    .catch((error) => {
      winstonLogger.error(error.message);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .set('Content-Type', 'application/problem+json')
        .json(ProblemDetails.create(
          'Something went wrong',
          error.message,
          'https://example.com/collections/internal-error',
          req.originalUrl,
          StatusCodes.INTERNAL_SERVER_ERROR,
        ));
    });
};

/**
 * Delete a category
 * @param {*} req
 * @param {*} res
 */
const deleteCategories = async (req, res = response) => {
  const { id } = req.params;

  // delete physically
  // const user = await User.findByIdAndDelete(id);

  const category = await Category.findByIdAndUpdate(id, { active: false });

  if (category != null) {
    return res.status(StatusCodes.OK)
      .json({
        category,
      });
  }

  const msg = `There is no category with ID ${id}`;
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
};

/**
 * Patch category (NOT IMPLEMENTED)
 * @param {*} req
 * @param {*} res
 */
const patchCategories = (res = response) => {
  res.status(StatusCodes.NOT_IMPLEMENTED)
    .json({
      msg: 'patch API',
    });
};

module.exports = {
  getCategories,
  getCategoryById,
  putCategories,
  postCategories,
  deleteCategories,
  patchCategories,
};
