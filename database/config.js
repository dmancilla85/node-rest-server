const mongoose = require('mongoose');
const winstonLogger = require('../middlewares/winston-logger');

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONN);
    winstonLogger.info('MongoDB: Conexión exitosa');
  } catch (error) {
    winstonLogger.error(error);
    throw new Error('Error al conectar la base de datos');
  }
};

module.exports = { dbConnection };
