const { ProblemDocument } = require('http-problem-details');
const { StatusCodes } = require('http-status-codes');

class ProblemDetails {
  static create(
    title,
    detail,
    type = 'https://example.com/server/internal-error',
    instance = 'unknown',
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR
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

const createProblem = (
  res,
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  title = 'Something went wrong :(',
  detail = 'There are some errors.',
  type = 'https://example.com/server/internal-error',
  url = 'unknown'
) =>
  res
    .status(statusCode)
    .set('Content-Type', 'application/problem+json')
    .json(ProblemDetails.create(title, detail, type, url, statusCode));

module.exports = { createProblem };
