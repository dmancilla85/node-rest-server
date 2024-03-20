const { Router } = require('express');
const { check } = require('express-validator');
const { login, googleSignIn } = require('../controllers');
const { validateFields } = require('../middlewares');

const router = Router();

router.post(
  '/login',
  [
    check('password', 'Password is required').isLength({ min: 6 }),
    check('email').isEmail().normalizeEmail(),
    validateFields,
  ],
  login
);

router.post(
  '/google',
  [
    check('id_token', 'Google token is required').not().isEmpty(),
    validateFields,
  ],
  googleSignIn
);

module.exports = router;
