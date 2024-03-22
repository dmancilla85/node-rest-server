const path = require('path');
const Grid = require('gridfs-stream');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { ObjectId } = require('mongoose').Types;
const { mongoose } = require('mongoose');
const { winstonLogger } = require('../utils');
const { getTimestamp } = require('../utils/files');

class GridFsService {
  constructor() {
    // GFS CONFIG
    // TODO: test whether it works
    Grid.mongo = mongoose.mongo;
    const conn = mongoose.connection;

    conn.once('open', () => {
      this.gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: process.env.UPLOADS_MONGO,
      });
      this.gfs = Grid(conn.db, mongoose.mongo);
      this.gfs.collection(process.env.UPLOADS_MONGO);
    });

    // CREATE STORAGE ENGINE
    this.mongoStorage = new GridFsStorage({
      db: conn,
      file: (_req, file) => ({
        bucketName: process.env.UPLOADS_MONGO,
        filename: getTimestamp(),
        metadata: { originalName: file.originalname },
      }),
    });

    this.logger = winstonLogger;
  }

  async getFileByName(fileName) {
    try {
      return this.gfs.files.findOne({ filename: fileName });
    } catch (error) {
      this.logger.error(`Can't recover the file ${fileName}: ${error.message}`);
      return undefined;
    }
  }

  async readFileContent(fileId) {
    try {
      if (!fileId || !ObjectId.isValid(fileId)) {
        return undefined;
      }

      return this.gridfsBucket.openDownloadStream(fileId);
    } catch (error) {
      this.logger.error(
        `Can't recover the content from file ID ${fileId}: ${error.message}`
      );
      return undefined;
    }
  }

  // check file ext & mimetype
  static checkType = (file, cb) => {
    const type = /csv|txt/;
    const content = ['text/plain', 'text/csv'];
    const isContent = content.filter((t) => t === file.mimetype);
    const extname = type.test(path.extname(file.originalname).toLowerCase());

    if (extname && file.mimetype === isContent[0]) {
      cb(null, true);
    } else {
      cb(
        {
          msg: 'El tipo de archivo no está admitido.',
        },
        null
      );
    }
  };

  uploadFileMiddleWare = multer({
    storage: this.mongoStorage,
    fileFilter: (req, file, cb) => {
      GridFsService.checkType(file, cb);
    },
  }).single('file');
}

const service = new GridFsService();
module.exports = service;
