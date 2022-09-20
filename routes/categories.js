const { Router } = require('express');
const { check } = require('express-validator');

const {
  postCategories,
  putCategories,
  deleteCategories,
  getCategories,
  getCategoryById,
} = require('../controllers');
const { categoryExists } = require('../helpers');
const { validarJWT, validarCampos } = require('../middlewares');

const router = Router();

router.get(
  '/',
  [validarJWT],
  getCategories,
);

router.get(
  '/:id',
  [
    validarJWT,
    check('id', 'Is not a valid ID').isLength({ min: 12 }).isMongoId(),
    validarCampos,
  ],
  getCategoryById,
);

router.post(
  '/',
  [
    validarJWT,
    check('name', 'Category name is required').not().isEmpty(),
    validarCampos,
  ],
  postCategories,
);

router.put(
  '/:id',
  [
    validarJWT,
    check('id', 'Is not a valid ID').isMongoId().custom(categoryExists),
    check('name', 'Category name is required').not().isEmpty(),
    validarCampos,
  ],
  putCategories,
);

router.delete(
  '/:id',
  [
    validarJWT,
    check('id', 'Is not a valid ID').isMongoId().custom(categoryExists),
    validarCampos,
  ],
  deleteCategories,
);

module.exports = router;
