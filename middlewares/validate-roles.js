const { response } = require('express');

const { StatusCodes } = require('http-status-codes');
const { winstonLogger, ProblemDetails } = require('../utils');

const isAdminRole = (req, next, res = response) => {
  if (!req.authUser) {
    const msg = 'The user is not authorized';
    winstonLogger.warn(msg);
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
  const { role, name } = req.authUser;

  if (role !== 'ADMIN_ROLE') {
    const msg = `${name} is not an administrator`;
    winstonLogger.warn(msg);
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
  next();

  return 0;
};

// middleware con argumentos
const hasRoles = (...roles) => (req, next, res = response) => {
  if (!req.authUser) {
    const msg = 'The user is not authorized';
    winstonLogger.warn(msg);
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

  if (!roles.includes(req.authUser.role)) {
    const msg = `The service requires one of the following roles: ${roles}`;
    winstonLogger.warn(msg);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .set('Content-Type', 'application/problem+json')
      .json(ProblemDetails.create(
        'User does not have the required role',
        msg,
        'https://example.com/auth/user-without-roles',
        req.originalUrl,
        StatusCodes.UNAUTHORIZED,
      ));
  }

  return next();
};

module.exports = { isAdminRole, hasRoles };
