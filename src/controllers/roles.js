const { response, request } = require('express');
const { StatusCodes } = require('http-status-codes');
const { winstonLogger, createProblem } = require('../utils');
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
      const msg = 'There is no roles.';
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
    return createProblem(
      res,
      StatusCodes.NOT_FOUND,
      'Item not found',
      msg,
      'https://example.com/collections/id-not-found',
      req.originalUrl
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
      return createProblem(
        res,
        StatusCodes.BAD_REQUEST,
        'Possible duplicated item',
        msg,
        'https://example.com/collections/duplicated-item',
        req.originalUrl,
        StatusCodes.NOT_FOUND
      );
    }

    const element = await rolesService.updateById(id, data);

    if (element != null) {
      return res.status(StatusCodes.OK).json(element);
    }

    const msg = `There is no role with ID ${id}`;
    winstonLogger.warn(msg);
    return createProblem(
      res,
      StatusCodes.BAD_REQUEST,
      'Some parameters are invalid.',
      msg,
      'https://example.com/collections/id-not-found',
      req.originalUrl
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
      return createProblem(
        res,
        StatusCodes.BAD_REQUEST,
        'Some parameters are invalid.',
        msg,
        'https://example.com/collections/element-already-exists',
        req.originalUrl
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
        return createProblem(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Something went wrong',
          error.message,
          'https://example.com/collections/internal-error',
          req.originalUrl
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
    return createProblem(
      res,
      StatusCodes.BAD_REQUEST,
      'Some parameters are invalid.',
      msg,
      'https://example.com/collections/id-not-found',
      req.originalUrl
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
    return createProblem(
      res,
      StatusCodes.BAD_REQUEST,
      'Some parameters are invalid.',
      msg,
      'https://example.com/collections/id-not-found',
      req.originalUrl
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
