const { response } = require('express');
const bcryptjs = require('bcryptjs');
const { generarJWT, googleVerify } = require('../helpers');
const { User } = require('../models');

const login = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    // check if mail exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: 'User / password are invalids.',
      });
    }

    // check user
    if (!user.state) {
      return res.status(400).json({
        msg: 'User is not active.',
      });
    }

    // verify password
    const validPassword = bcryptjs.compareSync(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        msg: 'User / password are invalids.',
      });
    }

    // generar JWT
    const token = await generarJWT(user._id);

    return res.json({
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Something went wrong',
    });
  }
};

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
      return res.status(401).json({
        msg: 'User is blocked. Please contact the admin',
      });
    }
    console.log(user);
    // generar JWT
    const token = await generarJWT(user._id);

    res.json({
      user,
      token,
    });

    return 0;
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      ok: false,
      msg: 'Unable to verify google token',
    });
  }
};

module.exports = {
  login,
  googleSignIn,
};
