const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { winstonLogger } = require('../helpers');
const ProblemDetails = require('../helpers/problem-details');
const { User } = require('../models');

const validarJWT = async (req, res, next) => {
  const token = req.header('x-token');

  if (!token) {
    const msg = 'There is no token in the request';
    winstonLogger.error(msg);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .set('Content-Type', 'application/problem+json')
      .json(ProblemDetails.create(
        'Token is missing',
        msg,
        'https://example.com/auth/invalid-token',
        req.originalUrl,
        StatusCodes.UNAUTHORIZED,
      ));
  }

  try {
    const { uid } = jwt.verify(token, process.env.SECRET_KEY);

    const authUser = await User.findById(uid);

    if (!authUser) {
      const msg = 'Nonexistent user';
      winstonLogger.error(msg);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .set('Content-Type', 'application/problem+json')
        .json(ProblemDetails.create(
          'User not found',
          msg,
          'https://example.com/auth/user-not-found',
          req.originalUrl,
          StatusCodes.BAD_REQUEST,
        ));
    }

    if (!authUser.state) {
      const msg = 'Unauthorized user';
      winstonLogger.warn(msg);
      return res
        .status(StatusCodes.FORBIDDEN)
        .set('Content-Type', 'application/problem+json')
        .json(ProblemDetails.create(
          'User without authorization',
          msg,
          'https://example.com/auth/user-not-authorized',
          req.originalUrl,
          StatusCodes.FORBIDDEN,
        ));
    }

    req.authUser = authUser;
    next();
  } catch (error) {
    const msg = 'Unauthorized token';
    winstonLogger.error(msg);
    winstonLogger.error(error.message);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .set('Content-Type', 'application/problem+json')
      .json(ProblemDetails.create(
        'User without authorization',
        msg,
        'https://example.com/auth/user-not-authorized',
        req.originalUrl,
        StatusCodes.UNAUTHORIZED,
      ));
  }

  return 0;
};

module.exports = { validarJWT };
