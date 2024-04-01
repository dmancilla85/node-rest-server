const { StatusCodes } = require('http-status-codes');
const { winstonLogger, createProblem } = require('../utils');
const { gridFsService } = require('../services');

const getFileFromMongoByName = async (req, res) => {
  try {
    const file = await gridFsService.getFileByName(req.params.filename);

    if (file === null || file === undefined) {
      winstonLogger.error(`File ${req.params.filename} not found`);

      return createProblem(
        res,
        StatusCodes.NOT_FOUND,
        'File not found',
        'The file not exists',
        'https://example.com/collections/not-found',
        req.originalUrl
      );
    }

    const readStream = await gridFsService.readFileContent(file._id);
    readStream.pipe(res);
  } catch (error) {
    winstonLogger.error(error.message);
    return createProblem(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Something went wrong...',
      error.message,
      'https://example.com/collections/not-found',
      req.originalUrl,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const sendFileToMongo = (req, res) => {
  gridFsService.uploadFileMiddleWare(req, res, (err) => {
    if (err) {
      winstonLogger.error(err?.message);
      return createProblem(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Something went wrong...',
        err.message,
        'https://example.com/collections/not-found',
        req.originalUrl,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    if (req.file) {
      res.status(StatusCodes.CREATED).send();
    } else {
      const msg = 'There is no file attached';
      winstonLogger.error(msg);
      return createProblem(
        res,
        StatusCodes.BAD_REQUEST,
        'Something went wrong...',
        msg,
        'https://example.com/collections/empty-file',
        req.originalUrl
      );
    }
  });
};

module.exports = {
  getFileFromMongoByName,
  sendFileToMongo,
};
