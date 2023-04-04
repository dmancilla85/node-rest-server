const { response, request } = require('express');
const { StatusCodes } = require('http-status-codes');
const { winstonLogger, ProblemDetails } = require('../helpers');
const { Product } = require('../models');

/**
 * Get all products
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getProducts = async (req = request, res = response) => {
  const { limit = 5, from = 0 } = req.query;

  const query = { active: true };

  const [count, products] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query)
      .populate('userId', 'name')
      .populate('categoryId', 'name')
      .skip(Number(from))
      .limit(Number(limit)),
  ]);

  if (count === 0) {
    const msg = 'There is no products';
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

  return res
    .status(StatusCodes.OK)
    .json({
      count,
      products,
    });
};

/**
 * Get product by ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getProductById = async (req = request, res = response) => {
  const { id } = req.params;

  const product = await Product.findById(id)
    .populate('userId', 'name')
    .populate('categoryId', 'name');

  if (product === null) {
    const msg = `Product with ID ${id} doesn't exist`;
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
  }

  return res.status(StatusCodes.OK)
    .json(product);
};

/**
 * Update product by ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const putProducts = async (req, res = response) => {
  const { id } = req.params;
  const {
    _id, active, userId, ...data
  } = req.body;

  data.userId = req.authUser._id;
  data.name = data.name.toUpperCase();

  const productExists = await Product.findOne({ name: data.name });

  if (productExists && productExists._id.toString() !== id) {
    const msg = `The product ${data.name} already exists`;
    winstonLogger.warning(msg);
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

  const product = await Product.findByIdAndUpdate(id, data);

  if (product != null) {
    return res
      .status(StatusCodes.OK)
      .json(product);
  }

  const msg = `There is no product with ID ${id}`;
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
 * Create new product
 * @param {*} req
 * @param {*} res
 * @returns
 */
const postProducts = async (req, res = response) => {
  const {
    name, price, description, available, categoryId,
  } = req.body;

  const productsExists = await Product.findOne({ name });

  if (productsExists) {
    const msg = `The product ${name} already exists`;
    winstonLogger.warn(msg);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .set('Content-Type', 'application/problem+json')
      .json(ProblemDetails.create(
        'Some parameters are invalid.',
        msg,
        'https://example.com/collections/duplicated-item',
        req.originalUrl,
        StatusCodes.BAD_REQUEST,
      ));
  }

  // data to save
  const data = {
    name: name.toUpperCase(),
    price,
    description,
    categoryId,
    available,
    userId: req.authUser._id,
  };

  const product = new Product(data);

  // save to DB
  return product.save()
    .then((prod) => res
      .status(StatusCodes.CREATED)
      .json({ prod }))
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
 * Delete a product by ID
 * @param {*} req
 * @param {*} res
 */
const deleteProducts = async (req, res = response) => {
  const { id } = req.params;

  // delete physically
  // const user = await User.findByIdAndDelete(id);

  const product = await Product.findByIdAndUpdate(id, { active: false });

  if (product != null) {
    return res.status(StatusCodes.OK)
      .json({
        product,
      });
  }

  const msg = `There is no product with ID ${id}`;
  winstonLogger.warning(msg);
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
 * Patch products (NOT IMPLEMENTED)
 * @param {*} req
 * @param {*} res
 */
const patchProducts = (req, res = response) => {
  res
    .status(StatusCodes.NOT_IMPLEMENTED)
    .json({
      msg: 'patch API',
    });
};

module.exports = {
  getProducts,
  getProductById,
  putProducts,
  postProducts,
  deleteProducts,
  patchProducts,
};
