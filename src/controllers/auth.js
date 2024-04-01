const { response } = require('express');
const { StatusCodes } = require('http-status-codes');
const { usersService, authService } = require('../services');
const {
  winstonLogger,
  createProblem,
  buildCircuit,
  BreakerState,
} = require('../utils');

/**
 * Login user
 * @param {*} req
 * @param {*} res
 * @returns
 */
const login = async (req, res = response, next) => {
  const { email, password } = req.body;
  let user;

  try {
    const circuit = buildCircuit('auth-login', 'auth_login');

    circuit
      .fn(async () => {
        // check if mail exists
        user = await usersService.emailExists(email);

        if (!user) {
          const msg = `User with email ${email} not exists.`;
          winstonLogger.warn(msg);
          return createProblem(
            res,
            StatusCodes.BAD_REQUEST,
            'Some parameters are invalid.',
            msg,
            'https://example.com/auth/resource-not-found',
            req.originalUrl
          );
        }

        // check user
        if (!user.active) {
          const msg = `User ${user.name} is inactive`;
          winstonLogger.warn(msg);
          return createProblem(
            res,
            StatusCodes.BAD_REQUEST,
            'Some parameters are invalid.',
            msg,
            'https://example.com/auth/invalid-user',
            req.originalUrl
          );
        }

        // generate JWT
        return authService.login(user, password);
      })
      .execute()
      .then((token) => {
        if (!token) {
          const msg = `User with email ${email} has entered an invalid password.`;
          winstonLogger.warn(msg);
          return createProblem(
            res,
            StatusCodes.BAD_REQUEST,
            'Some parameters are invalid.',
            msg,
            'https://example.com/auth/invalid-password',
            req.originalUrl
          );
        }

        return res.status(StatusCodes.OK).json({
          user,
          token,
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
            'Auth service is currently down.',
            'https://example.com/service-unavailable',
            req.originalUrl
          );
        }
        // Fallback Order response
        return createProblem(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Service down',
          'Auth service is down.',
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
 * Google Single Sign On function
 * @param {*} req
 * @param {*} res
 * @returns
 */
const googleSignIn = async (req, res = response, next) => {
  const { id_token } = req.body;
  let user;
  try {
    const circuit = buildCircuit('auth-google', 'auth_google');

    circuit
      .fn(async () => {
        const { name, picture, email } = await authService.googleValidate(
          id_token
        );

        if (!email) {
          const msg = 'Something went wrong with the Google verification';
          return createProblem(
            res,
            StatusCodes.BAD_REQUEST,
            'Some parameters are invalid.',
            msg,
            'https://example.com/auth/resource-not-found',
            req.originalUrl
          );
        }

        // verify email
        user = await usersService.emailExists(email);

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
        return authService.loginWithGoogle(user._id);
      })
      .execute()
      .then((token) => {
        if (!token) {
          const msg = 'Something went wrong with the JWT generation';
          return createProblem(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Something went wrong.',
            msg,
            'https://example.com/auth/internal-error',
            req.originalUrl
          );
        }

        winstonLogger.debug(`User ${user.name} logged succesfully.`);

        return res.status(StatusCodes.OK).json({
          user,
          token,
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
            'Auth service is currently down.',
            'https://example.com/service-unavailable',
            req.originalUrl
          );
        }
        // Fallback Order response
        return createProblem(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Service down',
          'Auth service is down.',
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
  login,
  googleSignIn,
};
