const validaCampos = require('./validate-fields');
const validarJWT = require('./validate-jwt');
const validarArchivo = require('./validate-file');
const validaRoles = require('./validate-roles');

module.exports = {
  ...validaCampos,
  ...validarJWT,
  ...validaRoles,
  ...validarArchivo,
};
