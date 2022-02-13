const { Router } = require("express");
const { check } = require("express-validator");
const { login, googleSignIn } = require("../controllers");
const { validarCampos } = require("../middlewares");
const router = Router();

router.post(
  "/login",
  [
    check("password", "Password is required").isLength({ min: 6 }),
    check("email").isEmail().normalizeEmail(),
    validarCampos
  ],
  login
);

router.post(
  "/google",
  [
    check("id_token", "Google token is required").not().isEmpty(),
    validarCampos
  ],
  googleSignIn
);

module.exports = router;
