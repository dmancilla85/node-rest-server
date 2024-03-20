const { Router } = require('express');
const { check } = require('express-validator');
const {
  postProducts,
  putProducts,
  deleteProducts,
  getProducts,
  getProductById,
} = require('../controllers');
const { productExists, categoryExists } = require('../utils');
const { validateJWT, validateFields } = require('../middlewares');

const router = Router();

router.get('/', getProducts);

router.get(
  '/:id',
  [
    check('id', 'Is not a valid ID').isMongoId().custom(productExists),
    validateFields,
  ],
  getProductById,
);

router.post(
  '/',
  [
    validateJWT,
    check('name', 'Product name is required').not().isEmpty(),
    check('categoryId', 'Is not a valid ID').isMongoId().custom(categoryExists),
    validateFields,
  ],
  postProducts,
);

router.put(
  '/:id',
  [
    validateJWT,
    check('id', 'Is not a valid ID').isMongoId().custom(productExists),
    check('categoryId', 'Is not a valid ID').isMongoId().custom(categoryExists),
    check('name', 'Product name is required').not().isEmpty(),
    validateFields,
  ],
  putProducts,
);

router.delete(
  '/:id',
  [
    validateJWT,
    check('id', 'Is not a valid ID').isMongoId().custom(productExists),
    validateFields,
  ],
  deleteProducts,
);

module.exports = router;
