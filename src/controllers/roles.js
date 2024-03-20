const { response, request } = require('express');
const { StatusCodes } = require('http-status-codes');
const { winstonLogger, ProblemDetails } = require('../utils');
const { rolesService } = require('../services');

/**
 * Get all roles
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getRoles = async (req = request, res = response, next) => {
  try {
    const { limit = 10, from = 0 } = req.query;

    const [count, elements] = await rolesService.getAll(from, limit);

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
      elements,
    });
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Get role by ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getRoleById = async (req = request, res = response, next) => {
  try {
    const { id } = req.params;
    const element = await rolesService.getById(id);

    if (element != null) {
      return res.status(StatusCodes.OK).json(element);
    }

    const msg = `Role with ID ${id} not found`;
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
 * Update roles by ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const putRoles = async (req, res = response, next) => {
  try {
    const { id } = req.params;
    const { _id, active, userId, ...data } = req.body;

    data.userId = req.authUser._id;
    data.name = data.name.toUpperCase();

    const exists = await rolesService.exists(data.name);

    if (exists) {
      const msg = `The role ${data.name} already exists`;
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

    const element = await rolesService.updateById(id, data);

    if (element != null) {
      return res.status(StatusCodes.OK).json(element);
    }

    const msg = `There is no role with ID ${id}`;
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
 * Create new role
 * @param {*} req
 * @param {*} res
 * @returns
 */
const postRoles = async (req, res = response, next) => {
  try {
    const name = req.body.name.toUpperCase();

    const exists = await rolesService.exists(name);

    if (exists) {
      const msg = `The role ${name} already exists`;
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
    return rolesService
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
 * Delete a role
 * @param {*} req
 * @param {*} res
 */
const deleteRoles = async (req, res = response, next) => {
  try {
    const { id } = req.params;

    // delete physically
    // const user = await User.findByIdAndDelete(id);

    const element = await rolesService.deleteById(id);

    if (element != null) {
      return res.status(StatusCodes.OK).json({
        element,
      });
    }

    const msg = `There is no role with ID ${id}`;
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
 * Patch role (DISABLE ROLE)
 * @param {*} req
 * @param {*} res
 */
const patchRoles = async (req, res = response, next) => {
  try {
    const { id } = req.params;

    const element = await rolesService.disableById(id);

    if (element != null) {
      return res.status(StatusCodes.OK).json({
        element,
      });
    }

    const msg = `There is no role with ID ${id}`;
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
  getRoles,
  getRoleById,
  putRoles,
  postRoles,
  deleteRoles,
  patchRoles,
};
