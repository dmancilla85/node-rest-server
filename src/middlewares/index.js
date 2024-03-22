const validateFields = require('./validate-fields');
const validateJWT = require('./validate-jwt');
const validateFile = require('./validate-file');
const validateRoles = require('./validate-roles');
const diskStorage = require('./disk-storage');

module.exports = {
  ...validateFields,
  ...validateJWT,
  ...validateRoles,
  ...validateFile,
  ...diskStorage,
};
