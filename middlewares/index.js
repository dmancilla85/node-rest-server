const validaCampos = require('./validar-campos');
const validarJWT = require('./validar-jwt');
const validarArchivo = require('./validar-archivo');
const validaRoles = require('./validar-roles');
const myLogger = require('./logger');

module.exports = {
  ...validaCampos,
  ...validarJWT,
  ...validaRoles,
  ...validarArchivo,
  ...myLogger,
};
