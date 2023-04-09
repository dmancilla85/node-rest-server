const { response } = require('express');
const bcryptjs = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
const { generateJWT, googleVerify } = require('../utils');
const { User } = require('../models');
const { winstonLogger, ProblemDetails } = require('../utils');

/**
 * Login user
 * @param {*} req
 * @param {*} res
 * @returns
 */
const login = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    // check if mail exists
    const user = await User.findOne({ email });

    if (!user) {
      const msg = `User with email ${email} not exists.`;
      winstonLogger.warn(msg);
      return res.status(StatusCodes.BAD_REQUEST)
        .set('Content-Type', 'application/problem+json')
        .json(ProblemDetails.create(
          'Some parameters are invalid.',
          msg,
          'https://example.com/login/invalid-user',
          req.originalUrl,
          StatusCodes.BAD_REQUEST,
        ));
    }

    // check user
    if (!user.state) {
      const msg = `User ${user.name} is inactive`;
      winstonLogger.warn(msg);
      return res.status(StatusCodes.BAD_REQUEST)
        .set('Content-Type', 'application/problem+json')
        .json(ProblemDetails.create(
          'Some parameters are invalid.',
          msg,
          'https://example.com/login/invalid-user',
          req.originalUrl,
          StatusCodes.BAD_REQUEST,
        ));
    }

    // verify password
    const validPassword = bcryptjs.compareSync(password, user.password);

    if (!validPassword) {
      const msg = `User with email ${email} has entered an invalid password.`;
      winstonLogger.warn(msg);
      return res.status(StatusCodes.BAD_REQUEST)
        .set('Content-Type', 'application/problem+json')
        .json(ProblemDetails.create(
          'Some parameters are invalid.',
          msg,
          'https://example.com/login/invalid-password',
          req.originalUrl,
          StatusCodes.BAD_REQUEST,
        ));
    }

    // generate JWT
    const token = await generateJWT(user._id);

    return res.status(StatusCodes.OK).json({
      user,
      token,
    });
  } catch (error) {
    winstonLogger.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .set('Content-Type', 'application/problem+json')
      .json(ProblemDetails.create(
        'Some parameters are invalid.',
        `Something went wrong: ${error.message}`,
        'https://example.com/login/invalid-user',
        req.originalUrl,
        StatusCodes.INTERNAL_SERVER_ERROR,
      ));
  }
};

/**
 * Google Single Sign On function
 * @param {*} req
 * @param {*} res
 * @returns
 */
const googleSignIn = async (req, res = response) => {
  const { id_token } = req.body;

  try {
    const { name, picture, email } = await googleVerify(id_token);

    // verify email
    let user = await User.findOne({ email });

    if (!user) {
      // create new one
      const data = {
        email,
        name,
        password: ':v',
        img: picture,
        google: true,
      };

      user = new User(data);
      await user.save();
    }

    if (!user.state) {
      winstonLogger.warn(`User ${user.name} is blocked`);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: `User ${user.name} is blocked. Please contact the admin`,
      });
    }
    // generar JWT
    const token = await generateJWT(user._id);

    winstonLogger.debug(`User ${user.name} logged succesfully.`);

    return res.status(StatusCodes.OK).json({
      user,
      token,
    });
  } catch (error) {
    winstonLogger.error('Unable to verify Google token.');
    return res.status(StatusCodes.UNAUTHORIZED).json({
      ok: false,
      msg: 'Unable to verify google token',
    });
  }
};

module.exports = {
  login,
  googleSignIn,
};
