const mongoose = require('mongoose');
const myLogger = require('../middlewares/logger');

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONN);
    myLogger.info('MongoDB: Conexión exitosa');
  } catch (error) {
    myLogger.error(error);
    throw new Error('Error al conectar la base de datos');
  }
};

module.exports = { dbConnection };
