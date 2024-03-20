const { response, request } = require('express');
const { StatusCodes } = require('http-status-codes');
const { usersService } = require('../services');
const { winstonLogger, ProblemDetails } = require('../utils');

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
