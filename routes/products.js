const { Router } = require('express');
const { check } = require('express-validator');
const {
  postProducts,
  putProducts,
  deleteProducts,
  getProducts,
  getProductById,
} = require('../controllers');
const { productExists, categoryExists } = require('../helpers');
const { validarJWT, validarCampos } = require('../middlewares');

const router = Router();

router.get('/', getProducts);

router.get(
  '/:id',
  [check('id', 'Is not a valid ID').isMongoId().custom(productExists)],
  getProductById,
);

router.post(
  '/',
  [
    validarJWT,
    check('name', 'Product name is required').not().isEmpty(),
    check('categoryId', 'Is not a valid ID').isMongoId().custom(categoryExists),
    validarCampos,
  ],
  postProducts,
);

router.put(
  '/:id',
  [
    validarJWT,
    check('id', 'Is not a valid ID').isMongoId().custom(productExists),
    check('categoryId', 'Is not a valid ID').isMongoId().custom(categoryExists),
    check('name', 'Product name is required').not().isEmpty(),
    validarCampos,
  ],
  putProducts,
);

router.delete(
  '/:id',
  [
    validarJWT,
    check('id', 'Is not a valid ID').isMongoId().custom(productExists),
    validarCampos,
  ],
  deleteProducts,
);

module.exports = router;
