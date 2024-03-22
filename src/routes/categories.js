const { Router } = require('express');
const { check } = require('express-validator');

const {
  postCategories,
  putCategories,
  deleteCategories,
  getCategories,
  getCategoryById,
} = require('../controllers');
const { categoryExists } = require('../utils');
const { validateJWT, validateFields } = require('../middlewares');

const router = Router();

router.get(
  '/',
  [validateJWT],
  getCategories,
);

router.get(
  '/:id',
  [
    validateJWT,
    check('id', 'Is not a valid ID').isLength({ min: 12 }).isMongoId(),
    validateFields,
  ],
  getCategoryById,
);

router.post(
  '/',
  [
    validateJWT,
    check('name', 'Category name is required').not().isEmpty(),
    validateFields,
  ],
  postCategories,
);

router.put(
  '/:id',
  [
    validateJWT,
    check('id', 'Is not a valid ID').isMongoId().custom(categoryExists),
    check('name', 'Category name is required').not().isEmpty(),
    validateFields,
  ],
  putCategories,
);

router.delete(
  '/:id',
  [
    validateJWT,
    check('id', 'Is not a valid ID').isMongoId().custom(categoryExists),
    validateFields,
  ],
  deleteCategories,
);

module.exports = router;
