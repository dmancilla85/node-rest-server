const jwt = require('jsonwebtoken');
const winstonLogger = require('../middlewares');

const generateJWT = async (uid = '') => new Promise((resolve, reject) => {
  const payload = { uid };
  jwt.sign(
    payload,
    process.env.SECRET_KEY,
    {
      expiresIn: '4h',
    },
    (err, token) => {
      if (err) {
        winstonLogger.error(`Can't generate the token with payload ${payload}`);
        reject(new Error(`Can't generate the token with payload ${payload}`));
      } else {
        winstonLogger.debug('Token generated.');
        resolve(token);
      }
    },
  );
});

module.exports = { generateJWT };
