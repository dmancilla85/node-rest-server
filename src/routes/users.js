const { Router } = require('express');
const { check } = require('express-validator');
const { isRoleValid, emailExists, userIdExists } = require('../utils');
const {
  getUsers,
  getUserById,
  putUsers,
  postUsers,
  deleteUsers,
  patchUsers,
} = require('../controllers');
const { validateFields, validateJWT, hasRoles } = require('../middlewares');

const router = Router();

router.get('', getUsers);

router.get(
  '/:id',
  [check('id', 'Is not a valid ID').isMongoId(), validateFields],
  getUserById
);

router.post(
  '',
  [
    validateJWT,
    check('name', 'Name is required').not().isEmpty(),
    check(
      'password',
      'Password is required and has to had a length over 6 characters'
    ).isLength({ min: 6 }),
    check('email').isEmail().normalizeEmail().custom(emailExists),
    check('role').custom(isRoleValid),
    validateFields,
  ],
  postUsers
);

router.patch('', patchUsers);

router.put(
  '/:id',
  [
    validateJWT,
    check('id', 'Is not a valid ID').isMongoId().custom(userIdExists),
    check('role').custom(isRoleValid),
    validateFields,
  ],
  putUsers
);

router.delete(
  '/:id',
  [
    validateJWT,
    hasRoles('ADMIN_ROLE', 'VENTAS_ROLE'),
    check('id', 'Is not a valid ID').isMongoId().custom(userIdExists),
    validateFields,
  ],
  deleteUsers
);

module.exports = router;
