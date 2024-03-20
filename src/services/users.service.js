const crypt = require('bcryptjs');
const { ObjectId } = require('mongoose').Types;
const { User } = require('../models');
const { winstonLogger } = require('../utils');

class UsersService {
  constructor() {
    this.model = User;
    this.logger = winstonLogger;
  }

  async getAll(from, limit) {
    const query = { active: true };

    return Promise.all([
      this.model.countDocuments(query),
      this.model.find(query).skip(Number(from)).limit(Number(limit)),
    ]);
  }

  async emailExists(email) {
    return this.model.findOne({ email });
  }

  async updatePassword(id, password) {
    const user = this.model.findById(id);

    if (password && user) {
      // encrypt the password
      const salt = crypt.genSaltSync();
      user.password = crypt.hashSync(password, salt);
      this.model.findByIdAndUpdate(id, user.password);
    }
  }

  async getById(id) {
    return this.model.findById(id);
  }

  // eslint-disable-next-line class-methods-use-this
  async create(data) {
    const element = new User(data);

    // encrypt the password
    const salt = crypt.genSaltSync();
    element.password = crypt.hashSync(data.password, salt);

    return element.save();
  }

  async updateById(id, data) {
    return this.model.findByIdAndUpdate(id, data);
  }

  async disableById(id) {
    return this.model.findByIdAndUpdate(id, { active: false });
  }

  async deleteById(id) {
    return this.model.findByIdAndRemove(id);
  }

  async search(term) {
    const isMongoId = ObjectId.isValid(term);

    if (isMongoId) {
      const user = await this.model.findById(term);
      return user ? [user] : [];
    }

    const regex = new RegExp(term, 'i');

    return this.model.find({
      $or: [{ name: regex }, { email: regex }],
      $and: [{ active: true }],
    });
  }
}

const service = new UsersService();
module.exports = service;
