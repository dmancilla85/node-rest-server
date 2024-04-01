const { response, request } = require('express');
const { StatusCodes } = require('http-status-codes');
const {
  winstonLogger,
  BreakerState,
  buildCircuit,
  createProblem,
} = require('../utils');
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

    const circuit = buildCircuit('get-categories', 'get_categories');

    circuit
      .fn(() => categoriesService.getAll(from, limit))
      .execute()
      .then((result) => {
        const [count, categories] = result;

        winstonLogger.debug(
          `Circuit ${circuit.name} state is ${circuit.modules[0].state}.`
        );

        if (count === 0) {
          const msg = 'There is no categories.';
          winstonLogger.warn(msg);
          return createProblem(
            res,
            StatusCodes.NOT_FOUND,
            'Empty collection',
            msg,
            'https://example.com/collections/empty',
            req.originalUrl
          );
        }

        return res.status(StatusCodes.OK).json({
          count,
          categories,
        });
      })
      .catch((error) => {
        winstonLogger.error(error.message);
        winstonLogger.debug(
          `Circuit ${circuit.name} state is ${circuit.modules[0].state}.`
        );

        if (circuit.modules[0].state === BreakerState.CLOSED) {
          return createProblem(
            res,
            StatusCodes.SERVICE_UNAVAILABLE,
            'Service down',
            'Categories service is currently down.',
            'https://example.com/service-unavailable',
            req.originalUrl
          );
        }
        // Fallback Order response
        return createProblem(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Service down',
          'Categories service is down.',
          'https://example.com/service-unavailable',
          req.originalUrl
        );
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
    const circuit = buildCircuit('get-categories-id', 'get_categories_id');

    circuit
      .fn(() => categoriesService.getById(id))
      .execute()
      .then((result) => {
        const category = result;

        if (category != null) {
          return res.status(StatusCodes.OK).json(category);
        }

        const msg = `Category with ID ${id} not found`;
        winstonLogger.warn(msg);
        return createProblem(
          res,
          StatusCodes.NOT_FOUND,
          'Resource not found',
          msg,
          'https://example.com/collections/id-not-found',
          req.originalUrl
        );
      })
      .catch((error) => {
        winstonLogger.error(error.message);
        winstonLogger.debug(
          `Circuit ${circuit.name} state is ${circuit.modules[0].state}.`
        );

        if (circuit.modules[0].state === BreakerState.CLOSED) {
          return createProblem(
            res,
            StatusCodes.SERVICE_UNAVAILABLE,
            'Service down',
            'Categories service is currently down.',
            'https://example.com/service-unavailable',
            req.originalUrl
          );
        }
        // Fallback Order response
        return createProblem(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Service down',
          'Categories service is down.',
          'https://example.com/service-unavailable',
          req.originalUrl
        );
      });
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

    const circuit = buildCircuit('update-category', 'update_category');

    circuit
      .fn(async () => {
        const categoryExists = await categoriesService.exists(data.name);

        if (categoryExists) {
          const msg = `The category ${data.name} already exists`;
          winstonLogger.warn(msg);
          return createProblem(
            res,
            StatusCodes.BAD_REQUEST,
            'Possible duplicated resource',
            msg,
            'https://example.com/collections/duplicated-item',
            req.originalUrl
          );
        }

        return categoriesService.updateById(id, data);
      })
      .execute()
      .then((result) => {
        winstonLogger.debug(
          `Circuit ${circuit.name} state is ${circuit.modules[0].state}.`
        );

        const category = result;

        if (category != null) {
          return res.status(StatusCodes.OK).json(category);
        }

        const msg = `There is no category with ID ${id}`;
        winstonLogger.warn(msg);
        return createProblem(
          res,
          StatusCodes.BAD_REQUEST,
          'Some parameters are invalid',
          msg,
          'https://example.com/collections/id-not-found',
          req.originalUrl
        );
      })
      .catch((error) => {
        winstonLogger.error(error.message);
        winstonLogger.debug(
          `Circuit ${circuit.name} state is ${circuit.modules[0].state}.`
        );

        if (circuit.modules[0].state === BreakerState.CLOSED) {
          return createProblem(
            res,
            StatusCodes.SERVICE_UNAVAILABLE,
            'Service down',
            'Categories service is currently down.',
            'https://example.com/service-unavailable',
            req.originalUrl
          );
        }
        // Fallback Order response
        return createProblem(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Service down',
          'Categories service is down.',
          'https://example.com/service-unavailable',
          req.originalUrl
        );
      });
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
    const circuit = buildCircuit('create-category', 'create_category');

    circuit
      .fn(async () => {
        const categoryExists = await categoriesService.exists(name);

        if (categoryExists) {
          const msg = `The category ${name} already exists`;
          winstonLogger.warn(msg);

          return createProblem(
            res,
            StatusCodes.BAD_REQUEST,
            'Some parameters are invalid.',
            msg,
            'https://example.com/categories/element-already-exists',
            req.originalUrl
          );
        }

        // data to save
        const data = {
          name,
          userId: req.authUser._id,
        };

        // save to DB
        return categoriesService.create(data);
      })
      .execute()
      .then((cat) => res.status(StatusCodes.CREATED).json({ cat }))
      .catch((error) => {
        winstonLogger.error(error.message);
        winstonLogger.debug(
          `Circuit ${circuit.name} state is ${circuit.modules[0].state}.`
        );

        if (circuit.modules[0].state === BreakerState.CLOSED) {
          return createProblem(
            res,
            StatusCodes.SERVICE_UNAVAILABLE,
            'Service down',
            'Categories service is currently down.',
            'https://example.com/service-unavailable',
            req.originalUrl
          );
        }
        // Fallback Order response
        return createProblem(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Service down',
          'Categories service is down.',
          'https://example.com/service-unavailable',
          req.originalUrl
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
    const circuit = buildCircuit('delete-category', 'delete_category');

    circuit
      .fn(async () => categoriesService.deleteById(id))
      .execute()
      .then((category) => {
        if (category != null) {
          return res.status(StatusCodes.OK).json({
            category,
          });
        }

        const msg = `There is no category with ID ${id}`;
        winstonLogger.warn(msg);
        return createProblem(
          res,
          StatusCodes.BAD_REQUEST,
          'Some parameters are invalid.',
          msg,
          'https://example.com/categories/resource-not-found',
          req.originalUrl
        );
      })
      .catch((error) => {
        winstonLogger.error(error.message);
        winstonLogger.debug(
          `Circuit ${circuit.name} state is ${circuit.modules[0].state}.`
        );

        if (circuit.modules[0].state === BreakerState.CLOSED) {
          return createProblem(
            res,
            StatusCodes.SERVICE_UNAVAILABLE,
            'Service down',
            'Categories service is currently down.',
            'https://example.com/service-unavailable',
            req.originalUrl
          );
        }
        // Fallback Order response
        return createProblem(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Service down',
          'Categories service is down.',
          'https://example.com/service-unavailable',
          req.originalUrl
        );
      });
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
    const circuit = buildCircuit('delete-category', 'delete_category');

    circuit
      .fn(async () => categoriesService.disableById(id))
      .execute()
      .then((category) => {
        if (category != null) {
          return res.status(StatusCodes.OK).json({
            category,
          });
        }

        const msg = `There is no category with ID ${id}`;
        winstonLogger.warn(msg);
        return createProblem(
          res,
          StatusCodes.BAD_REQUEST,
          'Some parameters are invalid.',
          msg,
          'https://example.com/categories/resource-not-found',
          req.originalUrl
        );
      })
      .catch((error) => {
        winstonLogger.error(error.message);
        winstonLogger.debug(
          `Circuit ${circuit.name} state is ${circuit.modules[0].state}.`
        );

        if (circuit.modules[0].state === BreakerState.CLOSED) {
          return createProblem(
            res,
            StatusCodes.SERVICE_UNAVAILABLE,
            'Service down',
            'Categories service is currently down.',
            'https://example.com/service-unavailable',
            req.originalUrl
          );
        }
        // Fallback Order response
        return createProblem(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Service down',
          'Categories service is down.',
          'https://example.com/service-unavailable',
          req.originalUrl
        );
      });
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
