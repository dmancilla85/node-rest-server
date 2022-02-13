const { User, Role, Category, Product } = require("../models");

const isRoleValid = async (role = "") => {
  const roleExists = await Role.findOne({ role });

  if (!roleExists) {
    throw new Error(`Role ${role} not found`);
  }
};

const emailExists = async (email = "") => {
  // check if mail exists
  const checkEmail = await User.findOne({ email });

  if (checkEmail) {
    throw new Error(`Mail ${email} already registered`);
  }
};

const categoryExists = async (id = "") => {
  const checkId = await Category.findById(id);

  if (!checkId) {
    throw new Error(`Category ID ${id} is not registered`);
  }
};

const productExists = async (id = "") => {
  const checkId = await Product.findById(id);

  if (!checkId) {
    throw new Error(`Product ID ${id} is not registered`);
  }
};

const userIdExists = async (id = "") => {
  const checkId = await User.findById(id);

  if (!checkId) {
    throw new Error(`ID ${id} is not registered`);
  }
};

module.exports = {
  isRoleValid,
  emailExists,
  userIdExists,
  categoryExists,
  productExists
};
