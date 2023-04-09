const Grid = require('gridfs-stream');
const { mongoose } = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const { uploadToMongo } = require('../configs/multer-storage');
const { winstonLogger, ProblemDetails } = require('../utils');

// GFS CONFIG
Grid.mongo = mongoose.mongo;
let gfs;
let gridfsBucket;
const conn = mongoose.connection;

conn.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: process.env.UPLOADS_MONGO,
  });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection(process.env.UPLOADS_MONGO);
});

const getFileFromMongoByName = async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });

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
            StatusCodes.NOT_FOUND,
          ),
        );
    }

    const readStream = gridfsBucket.openDownloadStream(file._id);
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
          StatusCodes.INTERNAL_SERVER_ERROR,
        ),
      );
  }
};

const sendFileToMongo = (req, res) => {
  uploadToMongo(req, res, (err) => {
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
            StatusCodes.INTERNAL_SERVER_ERROR,
          ),
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
            StatusCodes.BAD_REQUEST,
          ),
        );
    }
  });
};

module.exports = {
  getFileFromMongoByName,
  sendFileToMongo,
};
