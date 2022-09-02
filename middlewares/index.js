const validaCampos = require('./validar-campos');
const validarJWT = require('./validar-jwt');
const validarArchivo = require('./validar-archivo');
const validaRoles = require('./validar-roles');
const { winstonLogger } = require('./winston-logger');

module.exports = {
  ...validaCampos,
  ...validarJWT,
  ...validaRoles,
  ...validarArchivo,
  winstonLogger,
};
