const mongoose = require('mongoose');
const { winstonLogger } = require('../utils');

const dbConnection = async () => {
  try {
    mongoose.connect(process.env.MONGODB_CONN);
    winstonLogger.info('Successful connection to MongoDB');
  } catch (error) {
    winstonLogger.error('Failed to connect MongoDB server');
    winstonLogger.error(error.message);
    throw new Error('Failed to connect MongoDB server');
  }
};

module.exports = { dbConnection };
