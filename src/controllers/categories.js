const { response, request } = require('express');
const { StatusCodes } = require('http-status-codes');
const { winstonLogger, ProblemDetails } = require('../utils');
const { categoriesService } = require('../services');

/**
 * Get all categories
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getCategories = async (req = request, res = response, next) => {
  try {
    const { limit = 10, from = 0 } = req.query;

    const [count, categories] = await categoriesService.getAll(from, limit);

    if (count === 0) {
      const msg = 'There is no categories.';
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
      categories,
    });
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Get category by ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getCategoryById = async (req = request, res = response, next) => {
  try {
    const { id } = req.params;
    const category = await categoriesService.getById(id);

    if (category != null) {
      return res.status(StatusCodes.OK).json(category);
    }

    const msg = `Category with ID ${id} not found`;
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
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Update categories by ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const putCategories = async (req, res = response, next) => {
  try {
    const { id } = req.params;
    const { _id, active, userId, ...data } = req.body;

    data.userId = req.authUser._id;
    data.name = data.name.toUpperCase();

    const categoryExists = await categoriesService.exists(data.name);

    if (categoryExists) {
      const msg = `The category ${data.name} already exists`;
      winstonLogger.warn(msg);
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

    const category = await categoriesService.updateById(id, data);

    if (category != null) {
      return res.status(StatusCodes.OK).json(category);
    }

    const msg = `There is no category with ID ${id}`;
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
 * Create new category
 * @param {*} req
 * @param {*} res
 * @returns
 */
const postCategories = async (req, res = response, next) => {
  try {
    const name = req.body.name.toUpperCase();

    const categoryExists = await categoriesService.exists(name);

    if (categoryExists) {
      const msg = `The category ${name} already exists`;
      winstonLogger.warn(msg);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'Some parameters are invalid.',
            msg,
            'https://example.com/categorties/element-already-exists',
            req.originalUrl,
            StatusCodes.BAD_REQUEST
          )
        );
    }

    // data to save
    const data = {
      name,
      userId: req.authUser._id,
    };

    // save to DB
    return categoriesService
      .create(data)
      .then((cat) => res.status(StatusCodes.CREATED).json({ cat }))
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
 * Delete a category
 * @param {*} req
 * @param {*} res
 */
const deleteCategories = async (req, res = response, next) => {
  try {
    const { id } = req.params;

    const category = await categoriesService.deleteById(id);

    if (category != null) {
      return res.status(StatusCodes.OK).json({
        category,
      });
    }

    const msg = `There is no category with ID ${id}`;
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
 * Patch category (DISABLE CATEGORY)
 * @param {*} req
 * @param {*} res
 */
const patchCategories = async (req, res = response, next) => {
  const { id } = req.params;

  try {
    const category = await categoriesService.disableById(id);

    if (category != null) {
      return res.status(StatusCodes.OK).json({
        category,
      });
    }

    const msg = `There is no category with ID ${id}`;
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

module.exports = {
  getCategories,
  getCategoryById,
  putCategories,
  postCategories,
  deleteCategories,
  patchCategories,
};
