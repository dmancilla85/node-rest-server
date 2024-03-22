const bcryptjs = require('bcryptjs');
const { winstonLogger } = require('../utils');
const { generateJWT, googleVerify } = require('../utils');

class AuthService {
  constructor() {
    this.logger = winstonLogger;
  }

  async login(user, password) {
    const validPassword = bcryptjs.compareSync(password, user.password);

    if (!validPassword) {
      this.logger.warn(`Invalid password for user ${user.name}`);
      return undefined;
    }

    return generateJWT(user._id);
  }

  async googleValidate(id_token) {
    try {
      return googleVerify(id_token);
    } catch (error) {
      this.logger.error(`Error with Google validation: ${error.message}`);
      return undefined;
    }
  }

  async loginWithGoogle(id) {
    try {
      return generateJWT(id);
    } catch (error) {
      this.logger.error(`Error with Google token generation: ${error.message}`);
      return undefined;
    }
  }
}

const service = new AuthService();
module.exports = service;
