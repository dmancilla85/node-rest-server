const { response, request } = require("express");
const { Product } = require("../models");

// request and response added as default values to keep the type
const getProducts = async (req = request, res = response) => {
  const { limit = 5, from = 0 } = req.query;

  const query = { state: true };

  const [count, products] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query)
      .populate("userId", "name")
      .populate("categoryId", "name")
      .skip(Number(from))
      .limit(Number(limit))
  ]);

  res.json({
    count,
    products
  });
};

const getProductById = async (req = request, res = response) => {
  const id = req.params.id;
  const product = await Product.findById(id)
    .populate("userId", "name")
    .populate("categoryId", "name");

  res.json(product);
};

const putProducts = async (req, res = response) => {
  const id = req.params.id;
  const { _id, active, userId, ...data } = req.body;

  data.userId = req.authUser._id;
  data.name = data.name.toUpperCase();

  const productExists = await Product.findOne({ name: data.name });
  if (productExists && productExists._id.toString() !== id) {
    return res.status(400).json(`The product ${data.name} already exists`);
  }

  const product = await Product.findByIdAndUpdate(id, data);

  res.status(200).json(product);
};

const postProducts = async (req, res = response) => {
  const { name, price, description, available, categoryId } = req.body;

  const productsExists = await Product.findOne({ name });

  if (productsExists) {
    return res.status(400).json(`The product ${name} already exists`);
  }

  // data to save
  const data = {
    name: name.toUpperCase(),
    price,
    description,
    categoryId,
    available,
    userId: req.authUser._id
  };

  const product = new Product(data);

  // save to DB
  await product.save();

  res.status(201).json({
    product
  });
};

const deleteProducts = async (req, res = response) => {
  const id = req.params.id;

  // delete physically
  //const user = await User.findByIdAndDelete(id);

  const product = await Product.findByIdAndUpdate(id, { active: false });

  res.json({
    product
  });
};

const patchProducts = (req, res = response) => {
  res.json({
    msg: "patch API"
  });
};

module.exports = {
  getProducts,
  getProductById,
  putProducts,
  postProducts,
  deleteProducts,
  patchProducts
};
