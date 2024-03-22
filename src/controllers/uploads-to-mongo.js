const { StatusCodes } = require('http-status-codes');
const { winstonLogger, ProblemDetails } = require('../utils');
const { gridFsService } = require('../services');

const getFileFromMongoByName = async (req, res) => {
  try {
    const file = await gridFsService.getFileByName(req.params.filename);

    if (file === null || file === undefined) {
      winstonLogger.error(`File ${req.params.filename} not found`);

      res
        .status(StatusCodes.NOT_FOUND)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'File not found',
            'The file not exists',
            'https://example.com/collections/not-found',
            req.originalUrl,
            StatusCodes.NOT_FOUND
          )
        );
    }

    const readStream = await gridFsService.readFileContent(file._id);
    readStream.pipe(res);
  } catch (error) {
    winstonLogger.error(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .set('Content-Type', 'application/problem+json')
      .json(
        ProblemDetails.create(
          'Something went wrong...',
          error.message,
          'https://example.com/collections/not-found',
          req.originalUrl,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
  }
};

const sendFileToMongo = (req, res) => {
  gridFsService.uploadFileMiddleWare(req, res, (err) => {
    if (err) {
      winstonLogger.error(err?.message);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'Something went wrong...',
            err.message,
            'https://example.com/collections/not-found',
            req.originalUrl,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
    } else if (req.file) {
      res.status(StatusCodes.CREATED).send();
    } else {
      const msg = 'There is no file attached';
      winstonLogger.error(msg);
      res
        .status(StatusCodes.BAD_REQUEST)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'Something went wrong...',
            msg,
            'https://example.com/collections/empty-file',
            req.originalUrl,
            StatusCodes.BAD_REQUEST
          )
        );
    }
  });
};

module.exports = {
  getFileFromMongoByName,
  sendFileToMongo,
};
