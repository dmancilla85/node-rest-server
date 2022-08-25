const { response, request } = require('express');
const { Category } = require('../models');

// request and response added as default values to keep the type
const getCategories = async (req = request, res = response) => {
  const { limit = 5, from = 0 } = req.query;

  const query = { state: true };

  const [count, categories] = await Promise.all([
    Category.countDocuments(query),
    Category.find(query)
      .populate('userId', 'name')
      .skip(Number(from))
      .limit(Number(limit)),
  ]);

  res.json({
    count,
    categories,
  });
};

const getCategoryById = async (req = request, res = response) => {
  const { id } = req.params;
  const category = await Category.findById(id).populate('userId', 'name');

  res.json(category);
};

const putCategories = async (req, res = response) => {
  const { id } = req.params;
  const {
    _id, active, userId, ...data
  } = req.body;

  data.userId = req.authUser._id;
  data.name = data.name.toUpperCase();

  const categoryExists = await Category.findOne({ name: data.name });

  if (categoryExists) {
    return res.status(400).json(`The category ${data.name} already exists`);
  }

  const category = await Category.findByIdAndUpdate(id, data);

  res.status(200).json(category);
  return 0;
};

const postCategories = async (req, res = response) => {
  const name = req.body.name.toUpperCase();

  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    return res.status(400).json(`The category ${name} already exists`);
  }

  // data to save
  const data = {
    name,
    userId: req.authUser._id,
  };

  const category = new Category(data);

  // save to DB
  await category.save();

  res.status(201).json({
    category,
  });

  return 0;
};

const deleteCategories = async (req, res = response) => {
  const { id } = req.params;

  // delete physically
  // const user = await User.findByIdAndDelete(id);

  const category = await Category.findByIdAndUpdate(id, { active: false });

  res.json({
    category,
  });
};

const patchCategories = (req, res = response) => {
  res.json({
    msg: 'patch API',
  });
};

module.exports = {
  getCategories,
  getCategoryById,
  putCategories,
  postCategories,
  deleteCategories,
  patchCategories,
};
