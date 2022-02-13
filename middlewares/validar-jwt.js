const { response } = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const validarJWT = async (req, res = response, next) => {
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      msg: "There's no token in the request"
    });
  }

  try {
    const { uid } = jwt.verify(token, process.env.SECRET_KEY);

    authUser = await User.findById(uid);

    if (!authUser) {
      return res.status(401).json({
        msg: "Nonexistent user"
      });
    }

    if (!authUser.state) {
      return res.status(401).json({
        msg: "Unauthorized user"
      });
    }

    req.authUser = authUser;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      msg: "Unauthorized token"
    });
  }
};

module.exports = { validarJWT };
