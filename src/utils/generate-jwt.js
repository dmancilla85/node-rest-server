const jwt = require('jsonwebtoken');
const { winstonLogger } = require('./winston-logger');

const generateJWT = async (uid = '') =>
  new Promise((resolve, reject) => {
    const payload = { uid };

    console.log(payload);

    jwt.sign(
      payload,
      process.env.SECRET_KEY,
      {
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        allowInsecureKeySizes: false,
        expiresIn: process.env.JWT_EXPIRES_IN,
        algorithm: 'HS512',
      },
      (err, token) => {
        if (err) {
          const msg = `Can't generate the token with payload: ${err.message}`;
          winstonLogger.error(msg);
          reject(new Error(msg));
        } else {
          winstonLogger.debug('Token generated.');
          resolve(token);
        }
      }
    );
  });

module.exports = { generateJWT };
