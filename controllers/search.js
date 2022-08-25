const { response } = require('express');
const { ObjectId } = require('mongoose').Types;
const { User, Product, Category } = require('../models');

const collectionsAllowed = ['users', 'categories', 'products', 'roles'];

const searchUsers = async (term = '', res = response) => {
  const isMongoId = ObjectId.isValid(term);

  if (isMongoId) {
    const user = await User.findById(term);
    return res.json({ results: user ? [user] : [] });
  }

  const regex = new RegExp(term, 'i');

  const users = await User.find({
    $or: [{ name: regex }, { email: regex }],
    $and: [{ state: true }],
  });

  return res.json({ results: users });
};

const searchCategories = async (term = '', res = response) => {
  const isMongoId = ObjectId.isValid(term);

  if (isMongoId) {
    const category = await Category.findById(term);
    return res.json({ results: category ? [category] : [] });
  }

  const regex = new RegExp(term, 'i');

  const categories = await Category.find({
    name: regex,
    $and: [{ state: true }],
  });

  return res.json({ results: categories });
};

const searchProducts = async (term = '', res = response) => {
  const isMongoId = ObjectId.isValid(term);

  if (isMongoId) {
    const product = await Product.findById(term).populate('categoryId', 'name');
    return res.json({ results: product ? [product] : [] });
  }

  const regex = new RegExp(term, 'i');

  const products = await Product.find({
    $or: [{ name: regex }, { description: regex }],
    $and: [{ state: true }],
  }).populate('categoryId', 'name');

  return res.json({ results: products });
};

const search = async (req, res = response) => {
  const { collection, term } = req.params;

  if (!collectionsAllowed.includes(collection)) {
    return res.status(400).json({
      msg: `The collections allowed are ${collectionsAllowed}`,
    });
  }

  switch (collection) {
    case 'users':
      await searchUsers(term, res);
      break;
    case 'categories':
      await searchCategories(term, res);
      break;
    case 'products':
      await searchProducts(term, res);
      break;

    default:
      res.status(500).json({
        msg: 'Ups! Search not implemented yet',
      });
      break;
  }

  return 0;
};

module.exports = {
  search,
};
