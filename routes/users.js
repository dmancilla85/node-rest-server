const { Router } = require('express');
const { check } = require('express-validator');
const {
  isRoleValid,
  emailExists,
  userIdExists,
} = require('../helpers');
const {
  getUsers,
  getUserById,
  putUsers,
  postUsers,
  deleteUsers,
  patchUsers,
} = require('../controllers');
const { validarCampos, validarJWT, hasRoles } = require('../middlewares');

const router = Router();

router.get('', getUsers);

router.get(
  '/:id',
  [
    check('id', 'Is not a valid ID').isMongoId(),
    validarCampos,
  ],
  getUserById,
);

router.post(
  '',
  [
    validarJWT,
    check('name', 'Name is required').not().isEmpty(),
    check(
      'password',
      'Password is required and has to had a length over 6 characters',
    ).isLength({ min: 6 }),
    check('email').isEmail().normalizeEmail().custom(emailExists),
    check('role').custom(isRoleValid),
    validarCampos,
  ],
  postUsers,
);

router.patch('', patchUsers);

router.put(
  '/:id',
  [
    validarJWT,
    check('id', 'Is not a valid ID').isMongoId().custom(userIdExists),
    check('role').custom(isRoleValid),
    validarCampos,
  ],
  putUsers,
);

router.delete(
  '/:id',
  [
    validarJWT,
    hasRoles('ADMIN_ROLE', 'VENTAS_ROLE'),
    check('id', 'Is not a valid ID').isMongoId().custom(userIdExists),
    validarCampos,
  ],
  deleteUsers,
);

module.exports = router;
