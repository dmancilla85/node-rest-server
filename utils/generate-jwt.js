const jwt = require('jsonwebtoken');
const { winstonLogger } = require('./winston-logger');

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
        const msg = `Can't generate the token with payload ${payload}`;
        winstonLogger.error(msg);
        reject(new Error(msg));
      } else {
        winstonLogger.debug('Token generated.');
        resolve(token);
      }
    },
  );
});

module.exports = { generateJWT };
