const { response, request } = require('express');
const { StatusCodes } = require('http-status-codes');
const { usersService } = require('../services');
const { winstonLogger, createProblem } = require('../utils');

/**
 * Get users collection
 * request and response added as default values to keep the type
 * @param {*} req
 * @param {*} res
 */
const getUsers = async (req = request, res = response, next) => {
  try {
    const { limit = 10, from = 0 } = req.query;
    const [count, users] = await usersService.getAll(from, limit);

    if (count === 0) {
      const msg = 'There is no users.';
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
      users,
    });
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Get user by ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getUserById = async (req = request, res = response, next) => {
  try {
    const { id } = req.params;

    const user = await usersService.getById(id);

    if (user === null) {
      const msg = `User with ID ${id} doesn't exist`;
      winstonLogger.warn(msg);
      return createProblem(
        res,
        StatusCodes.NOT_FOUND,
        'Item not found',
        msg,
        'https://example.com/collections/id-not-found',
        req.originalUrl
      );
    }

    return res.status(StatusCodes.OK).json(user);
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Update user by ID
 * @param {*} req
 * @param {*} res
 */
const putUsers = async (req, res = response, next) => {
  try {
    const { id } = req.params;
    const { _id, password, google, ...resto } = req.body;

    const user = await usersService.updateById(id, resto);

    if (user === null) {
      const msg = `There is no user with ID ${id}`;
      winstonLogger.warn(msg);
      return createProblem(
        res,
        StatusCodes.BAD_REQUEST,
        'Some parameters are invalid.',
        msg,
        'https://example.com/collections/id-not-found',
        req.originalUrl
      );
    }

    if (password) {
      user.password = password;
      usersService.updatePassword(id, password);
    }

    winstonLogger.info(`User with ID ${id} was updated.`);

    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Create new user
 * @param {*} req
 * @param {*} res
 */
const postUsers = async (req, res = response, next) => {
  try {
    const { name, email, password, role } = req.body;

    // save to DB
    return usersService
      .create({
        name,
        email,
        password,
        role,
      })
      .then((usr) => res.status(StatusCodes.CREATED).json({ usr }))
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
 * Delete an user by ID
 * @param {*} req
 * @param {*} res
 */
const deleteUsers = async (req, res = response, next) => {
  try {
    const { id } = req.params;

    const user = await usersService.deleteById(id);

    if (user === null) {
      const msg = `There is no user with ID ${id}`;
      winstonLogger.warn(msg);
      return createProblem(
        res,
        StatusCodes.BAD_REQUEST,
        'Some parameters are invalid.',
        msg,
        'https://example.com/collections/id-not-found',
        req.originalUrl
      );
    }

    return res.status(StatusCodes.OK).json({
      user,
    });
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Patch user (NOT IMPLEMENTED)
 * @param {*} req
 * @param {*} res
 */
const patchUsers = async (req, res = response, next) => {
  try {
    const { id } = req.params;

    const user = await usersService.disableById(id);

    if (user === null) {
      const msg = `There is no user with ID ${id}`;
      winstonLogger.warn(msg);
      return createProblem(
        res,
        StatusCodes.BAD_REQUEST,
        'Some parameters are invalid.',
        msg,
        'https://example.com/collections/id-not-found',
        req.originalUrl
      );
    }

    return res.status(StatusCodes.OK).json({
      user,
    });
  } catch (error) {
    next(error);
    return undefined;
  }
};

module.exports = {
  getUsers,
  getUserById,
  putUsers,
  postUsers,
  deleteUsers,
  patchUsers,
};
