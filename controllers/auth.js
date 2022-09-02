const { response } = require('express');
const bcryptjs = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
const { generateJWT, googleVerify } = require('../helpers');
const { User } = require('../models');
const winstonLogger = require('../middlewares');

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
      winstonLogger.warning(`User with email ${email} not exists.`);
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: `User with email ${email} not exists.`,
      });
    }

    // check user
    if (!user.state) {
      winstonLogger.warning(`User ${user.name} is inactive`);
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: `User ${user.name} is inactive`,
      });
    }

    // verify password
    const validPassword = bcryptjs.compareSync(password, user.password);

    if (!validPassword) {
      winstonLogger.warning(`User with email ${email} has entered an invalid password.`);
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: `User with email ${email} has entered an invalid password.`,
      });
    }

    // generate JWT
    const token = await generateJWT(user._id);

    return res.status(StatusCodes.OK).json({
      user,
      token,
    });
  } catch (error) {
    winstonLogger.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: `Something went wrong: ${error}`,
    });
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
      winstonLogger.warning(`User ${user.name} is blocked`);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: `User ${user.name} is blocked. Please contact the admin`,
      });
    }
    // generar JWT
    const token = await generateJWT(user._id);

    res.status(StatusCodes.OK).json({
      user,
      token,
    });

    winstonLogger.debug(`User ${user.name} logged succesfully.`);
    return 0;
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
