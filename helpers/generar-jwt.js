const jwt = require('jsonwebtoken');

const generarJWT = async (uid = '') => new Promise((resolve, reject) => {
  const payload = { uid };
  jwt.sign(
    payload,
    process.env.SECRET_KEY,
    {
      expiresIn: '4h',
    },
    (err, token) => {
      if (err) {
        // console.log(err);
        reject(new Error('No se pudo generar el token'));
      } else {
        resolve(token);
      }
    },
  );
});

module.exports = { generarJWT };
