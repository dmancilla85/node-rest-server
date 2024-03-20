const { response, request } = require('express');

const { StatusCodes } = require('http-status-codes');
const { winstonLogger, ProblemDetails } = require('../utils');
const { productsService } = require('../services');

/**
 * Get all products
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getProducts = async (req = request, res = response, next) => {
  try {
    const { limit = 10, from = 0 } = req.query;
    const [count, products] = await productsService.getAll(from, limit);

    if (count === 0) {
      const msg = 'There is no products';
      winstonLogger.warn(msg);
      return res
        .status(StatusCodes.NOT_FOUND)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'Empty collection',
            msg,
            'https://example.com/collections/empty',
            req.originalUrl,
            StatusCodes.NOT_FOUND
          )
        );
    }

    return res.status(StatusCodes.OK).json({
      count,
      products,
    });
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Get product by ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getProductById = async (req = request, res = response, next) => {
  try {
    const { id } = req.params;

    const product = await productsService.getProductById(id);

    if (product === null) {
      const msg = `Product with ID ${id} doesn't exist`;
      winstonLogger.warn(msg);
      return res
        .status(StatusCodes.NOT_FOUND)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'Item not found',
            msg,
            'https://example.com/collections/id-not-found',
            req.originalUrl,
            StatusCodes.NOT_FOUND
          )
        );
    }

    return res.status(StatusCodes.OK).json(product);
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Update product by ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const putProducts = async (req, res = response, next) => {
  try {
    const { id } = req.params;
    const { _id, active, userId, ...data } = req.body;

    data.userId = req.authUser._id;
    data.name = data.name.toUpperCase();

    const productExists = await productsService.exists(data.name);

    if (productExists && productExists._id.toString() !== id) {
      const msg = `The product ${data.name} already exists`;
      winstonLogger.warning(msg);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'Possible duplicated item',
            msg,
            'https://example.com/collections/duplicated-item',
            req.originalUrl,
            StatusCodes.NOT_FOUND
          )
        );
    }

    const product = await productsService.updateById(id, data);

    if (product != null) {
      return res.status(StatusCodes.OK).json(product);
    }

    const msg = `There is no product with ID ${id}`;
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
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Create new product
 * @param {*} req
 * @param {*} res
 * @returns
 */
const postProducts = async (req, res = response, next) => {
  try {
    const { name, price, description, available, categoryId } = req.body;

    const productsExists = await productsService.exists(name);

    if (productsExists) {
      const msg = `The product ${name} already exists`;
      winstonLogger.warn(msg);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'Some parameters are invalid.',
            msg,
            'https://example.com/collections/duplicated-item',
            req.originalUrl,
            StatusCodes.BAD_REQUEST
          )
        );
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

    // save to DB
    return productsService
      .create(data)
      .then((prod) => res.status(StatusCodes.CREATED).json({ prod }))
      .catch((error) => {
        winstonLogger.error(error.message);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .set('Content-Type', 'application/problem+json')
          .json(
            ProblemDetails.create(
              'Something went wrong',
              error.message,
              'https://example.com/collections/internal-error',
              req.originalUrl,
              StatusCodes.INTERNAL_SERVER_ERROR
            )
          );
      });
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Delete a product by ID
 * @param {*} req
 * @param {*} res
 */
const deleteProducts = async (req, res = response, next) => {
  try {
    const { id } = req.params;

    // delete physically
    // const user = await User.findByIdAndDelete(id);

    const product = await productsService.deleteById(id);

    if (product != null) {
      return res.status(StatusCodes.OK).json({
        product,
      });
    }

    const msg = `There is no product with ID ${id}`;
    winstonLogger.warning(msg);
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
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Disable/enable products
 * @param {*} req
 * @param {*} res
 */
const patchProducts = async (req, res = response, next) => {
  try {
    const { id } = req.params;

    // delete physically
    // const user = await User.findByIdAndDelete(id);

    const product = await productsService.disableById(id);

    if (product != null) {
      return res.status(StatusCodes.OK).json({
        product,
      });
    }

    const msg = `There is no product with ID ${id}`;
    winstonLogger.warning(msg);
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
  } catch (error) {
    next(error);
    return undefined;
  }
};

module.exports = {
  getProducts,
  getProductById,
  putProducts,
  postProducts,
  deleteProducts,
  patchProducts,
};
