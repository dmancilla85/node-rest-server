const { response } = require('express');
const { StatusCodes } = require('http-status-codes');
const { winstonLogger, ProblemDetails } = require('../helpers');

const validateFile = (req, next, res = response) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    winstonLogger.warn('No files were uploaded');
    return res
      .status(StatusCodes.BAD_REQUEST)
      .set('Content-Type', 'application/problem+json')
      .json(ProblemDetails.create(
        'No files to upload',
        'No files were uploaded',
        'https://example.com/uploads/no-files-to-upload',
        req.originalUrl,
        StatusCodes.BAD_REQUEST,
      ));
  }

  next();
};

module.exports = { validateFile };
