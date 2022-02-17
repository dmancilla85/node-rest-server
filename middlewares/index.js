const validaCampos = require("../middlewares/validar-campos");
const validarJWT = require("../middlewares/validar-jwt");
const validarArchivo = require("../middlewares/validar-archivo");
const validaRoles = require("../middlewares/validar-roles");

module.exports = {
  ...validaCampos,
  ...validarJWT,
  ...validaRoles,
  ...validarArchivo
};
