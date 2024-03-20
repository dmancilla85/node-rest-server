const { response } = require('express');
const { StatusCodes } = require('http-status-codes');
const { usersService, authService } = require('../services');
const { winstonLogger, ProblemDetails } = require('../utils');

/**
 * Login user
 * @param {*} req
 * @param {*} res
 * @returns
 */
const login = async (req, res = response, next) => {
  const { email, password } = req.body;

  try {
    // check if mail exists
    const user = await usersService.emailExists(email);

    if (!user) {
      const msg = `User with email ${email} not exists.`;
      winstonLogger.warn(msg);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'Some parameters are invalid.',
            msg,
            'https://example.com/login/invalid-user',
            req.originalUrl,
            StatusCodes.BAD_REQUEST
          )
        );
    }

    // check user
    if (!user.active) {
      const msg = `User ${user.name} is inactive`;
      winstonLogger.warn(msg);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'Some parameters are invalid.',
            msg,
            'https://example.com/login/invalid-user',
            req.originalUrl,
            StatusCodes.BAD_REQUEST
          )
        );
    }

    // generate JWT
    const token = await authService.login(user, password);

    if (!token) {
      const msg = `User with email ${email} has entered an invalid password.`;
      winstonLogger.warn(msg);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'Some parameters are invalid.',
            msg,
            'https://example.com/login/invalid-password',
            req.originalUrl,
            StatusCodes.BAD_REQUEST
          )
        );
    }

    return res.status(StatusCodes.OK).json({
      user,
      token,
    });
  } catch (error) {
    next(error);
    return undefined;
  }
};

/**
 * Google Single Sign On function
 * @param {*} req
 * @param {*} res
 * @returns
 */
const googleSignIn = async (req, res = response, next) => {
  const { id_token } = req.body;

  try {
    const { name, picture, email } = await authService.googleValidate(id_token);

    if (!email) {
      throw new Error('Something went wrong with the Google verification');
    }

    // verify email
    const user = await usersService.emailExists(email);

    if (!user) {
      // create new one
      const data = {
        email,
        name,
        password: ':v',
        img: picture,
        google: true,
      };

      await usersService.create(data);
    }

    if (!user.active) {
      winstonLogger.warn(`User ${user.name} is blocked`);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: `User ${user.name} is blocked. Please contact the admin`,
      });
    }
    // generar JWT
    const token = authService.loginWithGoogle(user._id);

    if (!token) {
      throw new Error('Something went wrong with the JWT generation');
    }

    winstonLogger.debug(`User ${user.name} logged succesfully.`);

    return res.status(StatusCodes.OK).json({
      user,
      token,
    });
  } catch (error) {
    next(error);
    return undefined;
  }
};

module.exports = {
  login,
  googleSignIn,
};
