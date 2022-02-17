const { User, Role, Category, Product } = require("../models");

const collectionsAllowed = (collection = "", collections = []) => {
  const check = collections.includes(collection);

  if (!check) {
    throw new error(
      `The ${collection} collection is not allowed: ${collections}`
    );
  }
  return true;
};

const isRoleValid = async (role = "") => {
  const roleExists = await Role.findOne({ role });

  if (!roleExists) {
    throw new Error(`Role ${role} not found`);
  }

  return true;
};

const emailExists = async (email = "") => {
  // check if mail exists
  const checkEmail = await User.findOne({ email });

  if (checkEmail) {
    throw new Error(`Mail ${email} already registered`);
  }

  return true;
};

const categoryExists = async (id = "") => {
  const checkId = await Category.findById(id);

  if (!checkId) {
    throw new Error(`Category ID ${id} is not registered`);
  }

  return true;
};

const productExists = async (id = "") => {
  const checkId = await Product.findById(id);

  if (!checkId) {
    throw new Error(`Product ID ${id} is not registered`);
  }

  return true;
};

const userIdExists = async (id = "") => {
  const checkId = await User.findById(id);

  if (!checkId) {
    throw new Error(`ID ${id} is not registered`);
  }

  return true;
};

module.exports = {
  isRoleValid,
  emailExists,
  userIdExists,
  categoryExists,
  productExists,
  collectionsAllowed
};
