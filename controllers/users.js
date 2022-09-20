const { response, request } = require('express');
const crypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
const { User } = require('../models');
const { winstonLogger, ProblemDetails } = require('../helpers');

/**
 * Get users collection
 * request and response added as default values to keep the type
 * @param {*} req
 * @param {*} res
 */
const getUsers = async (req = request, res = response) => {
  const { limit = 5, from = 0 } = req.query;

  const query = { state: true };

  const [count, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query).skip(Number(from)).limit(Number(limit)),
  ]);

  if (count === 0) {
    const msg = 'There is no users.';
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
      users,
    });
};

/**
 * Get user by ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getUserById = async (req = request, res = response) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .populate('userId', 'name')
    .populate('categoryId', 'name');

  if (user === null) {
    const msg = `User with ID ${id} doesn't exist`;
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

  return res
    .status(StatusCodes.OK)
    .json(user);
};

/**
 * Update user by ID
 * @param {*} req
 * @param {*} res
 */
const putUsers = async (req, res = response) => {
  const { id } = req.params;
  const {
    _id, password, google, ...resto
  } = req.body;

  const user = await User.findByIdAndUpdate(id, resto);

  if (user === null) {
    const msg = `There is no user with ID ${id}`;
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
  }

  if (password) {
    // encrypt the password
    const salt = crypt.genSaltSync();
    user.password = crypt.hashSync(password, salt);
  }

  winstonLogger.info(`User with ID ${id} was updated.`);

  res
    .status(StatusCodes.OK)
    .json(user);
};

/**
 * Create new user
 * @param {*} req
 * @param {*} res
 */
const postUsers = async (req, res = response) => {
  const {
    name, email, password, role,
  } = req.body;

  const user = new User({
    name, email, password, role,
  });

  // encrypt the password
  const salt = crypt.genSaltSync();
  user.password = crypt.hashSync(password, salt);

  // save to DB
  return user.save()
    .then((usr) => res
      .status(StatusCodes.CREATED)
      .json({ usr }))
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
 * Delete an user by ID
 * @param {*} req
 * @param {*} res
 */
const deleteUsers = async (req, res = response) => {
  const { id } = req.params;

  // delete physically
  // const user = await User.findByIdAndDelete(id);

  const user = await User.findByIdAndUpdate(id, { state: false });

  if (user === null) {
    const msg = `There is no user with ID ${id}`;
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
  }

  return res
    .status(StatusCodes.OK)
    .json({
      user,
    });
};

/**
 * Patch user (NOT IMPLEMENTED)
 * @param {*} req
 * @param {*} res
 */
const patchUsers = (req, res = response) => {
  res
    .status(StatusCodes.NOT_IMPLEMENTED)
    .json({
      msg: 'patch API not implemented',
    });
};

module.exports = {
  getUsers,
  getUserById,
  putUsers,
  postUsers,
  deleteUsers,
  patchUsers,
};
