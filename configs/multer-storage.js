const multer = require('multer');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');
const { mongoose } = require('mongoose');
const { getTimestamp } = require('../utils/files');

const conn = mongoose.connection;

// CREATE STORAGE ENGINE
const mongoStorage = new GridFsStorage({
  db: conn,
  file: (req, file) => ({
    bucketName: process.env.UPLOADS_MONGO,
    filename: getTimestamp(),
    metadata: { originalName: file.originalname },
  }),
});

// check file ext & mimetype
const checkType = (file, cb) => {
  const type = /csv|txt/;
  const content = ['text/plain', 'text/csv'];
  const isContent = content.filter((t) => t === file.mimetype);
  const extname = type.test(path.extname(file.originalname).toLowerCase());
  const mimetype = type.test(file.mimetype);

  if (extname && mimetype && file.mimetype == isContent[0]) {
    cb(null, true);
  } else {
    cb(
      {
        msg: 'El tipo de archivo no está admitido.',
      },
      null,
    );
  }
};

const uploadToMongo = multer({
  storage: mongoStorage,
  fileFilter: (req, file, cb) => {
    checkType(file, cb);
  },
}).single('file');

module.exports = { uploadToMongo };
