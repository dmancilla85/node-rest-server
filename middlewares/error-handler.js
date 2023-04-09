const { StatusCodes } = require('http-status-codes');
const { winstonLogger, ProblemDetails } = require('../utils');

const errorHandler = (err, req, res, next) => {
  console.log('peruca');

  if (res.headersSent) {
    return next(err);
  }

  winstonLogger.error(err.message);
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .set('Content-Type', 'application/problem+json')
    .json(
      ProblemDetails.create(
        'Something went wrong',
        err.message,
        'https://example.com/collections/internal-error',
        req.originalUrl,
        StatusCodes.INTERNAL_SERVER_ERROR,
      ),
    );
};

module.exports = { errorHandler };
