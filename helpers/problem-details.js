const { ProblemDocument } = require('http-problem-details');
const { StatusCodes } = require('http-status-codes');

class ProblemDetails {
  static create(
    title,
    detail,
    type = 'https://example.com/server/internal-error',
    instance = 'unknown',
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    return new ProblemDocument({
      type,
      title: title ?? StatusCodes[statusCode],
      detail,
      instance,
      status: statusCode,
    });
  }
}

module.exports = ProblemDetails;
