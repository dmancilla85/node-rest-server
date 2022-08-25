const { response, request } = require('express');
const crypt = require('bcryptjs');
const { User } = require('../models');

// request and response added as default values to keep the type
const getUsers = async (req = request, res = response) => {
  const { limit = 5, from = 0 } = req.query;

  const query = { state: true };

  const [count, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query).skip(Number(from)).limit(Number(limit)),
  ]);

  res.json({
    count,
    users,
  });
};

const putUsers = async (req, res = response) => {
  const { id } = req.params;
  const {
    _id, password, google, ...resto
  } = req.body;

  const user = await User.findByIdAndUpdate(id, resto);

  if (password) {
    // encrypt the password
    const salt = crypt.genSaltSync();
    user.password = crypt.hashSync(password, salt);
  }

  res.json(user);
};

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
  await user.save();

  res.json({
    msg: 'post API',
    user,
  });
};

const deleteUsers = async (req, res = response) => {
  const { id } = req.params;

  // delete physically
  // const user = await User.findByIdAndDelete(id);

  const user = await User.findByIdAndUpdate(id, { state: false });

  res.json({
    user,
  });
};

const patchUsers = (req, res = response) => {
  res.json({
    msg: 'patch API',
  });
};

module.exports = {
  getUsers,
  putUsers,
  postUsers,
  deleteUsers,
  patchUsers,
};
