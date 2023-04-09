const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');
const { winstonLogger, ProblemDetails } = require('../utils');

const validateFields = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    winstonLogger.warn(`There are errors: ${JSON.stringify(errors)}`);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .set('Content-Type', 'application/problem+json')
      .json(ProblemDetails.create(
        'Some parameters have not passed validation.',
        errors,
        'https://example.com/request/validation-errors',
        req.originalUrl,
        StatusCodes.BAD_REQUEST,
      ));
  }

  return next();
};

module.exports = { validateFields };
