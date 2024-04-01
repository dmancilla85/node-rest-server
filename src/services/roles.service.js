const { ObjectId } = require('mongoose').Types;
const { Role } = require('../models');
const { winstonLogger } = require('../utils');

class RolesService {
  constructor() {
    this.model = Role;
    this.logger = winstonLogger;
  }

  async getAll(from, limit) {
    const query = { active: true };

    return Promise.all([
      this.model.countDocuments(query),
      this.model.find(query).skip(Number(from)).limit(Number(limit)),
    ]);
  }

  async exists(name) {
    return this.model.findOne({ name });
  }

  async getById(id) {
    return this.model.findById(id);
  }

  // eslint-disable-next-line class-methods-use-this
  async create(data) {
    const element = new Role(data);

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
      const role = await this.model.findById(term);
      return role ? [role] : [];
    }

    const regex = new RegExp(term, 'i');

    return this.model.find({
      name: regex,
      $and: [{ active: true }],
    });
  }
}

const service = new RolesService();
module.exports = service;
