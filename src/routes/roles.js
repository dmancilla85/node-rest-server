const { Router } = require('express');
const { check } = require('express-validator');

const {
  postRoles,
  putRoles,
  deleteRoles,
  getRoles,
  getRoleById,
} = require('../controllers');
const { roleExists } = require('../utils');
const { validateJWT, validateFields } = require('../middlewares');

const router = Router();

router.get('/', [validateJWT], getRoles);

router.get(
  '/:id',
  [
    validateJWT,
    check('id', 'Is not a valid ID').isLength({ min: 12 }).isMongoId(),
    validateFields,
  ],
  getRoleById
);

router.post(
  '/',
  [
    validateJWT,
    check('name', 'Role name is required').not().isEmpty(),
    validateFields,
  ],
  postRoles
);

router.put(
  '/:id',
  [
    validateJWT,
    check('id', 'Is not a valid ID').isMongoId().custom(roleExists),
    check('name', 'Role name is required').not().isEmpty(),
    validateFields,
  ],
  putRoles
);

router.delete(
  '/:id',
  [
    validateJWT,
    check('id', 'Is not a valid ID').isMongoId().custom(roleExists),
    validateFields,
  ],
  deleteRoles
);

module.exports = router;
