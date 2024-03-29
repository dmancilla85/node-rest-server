const { ObjectId } = require('mongoose').Types;
const { Category } = require('../models');
const { winstonLogger } = require('../utils');

class CategoriesService {
  constructor() {
    this.model = Category;
    this.logger = winstonLogger;
  }

  async getAll(from, limit) {
    const query = { active: true };

    return Promise.all([
      this.model.countDocuments(query),
      this.model
        .find(query)
        .populate('userId', 'name')
        .skip(Number(from))
        .limit(Number(limit)),
    ]);
  }

  async exists(name) {
    return this.model.findOne({ name });
  }

  async getById(id) {
    // throw new Error('oh pichula');
    return this.model.findById(id).populate('userId', 'name');
  }

  // eslint-disable-next-line class-methods-use-this
  async create(data) {
    const element = new Category(data);

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
      const category = await this.model.findById(term);
      return category ? [category] : [];
    }

    const regex = new RegExp(term, 'i');

    return this.model.find({
      name: regex,
      $and: [{ active: true }],
    });
  }
}

const service = new CategoriesService();
module.exports = service;
