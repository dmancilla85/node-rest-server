const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { winstonLogger } = require('./winston-logger');

/**
 * Generates a timestamp name to add to a file name
 * @returns
 */
const getTimestamp = () => new Date()
  .toISOString()
  .replaceAll('-', '')
  .replace('T', '_')
  .replaceAll(':', '')
  .substring(0, 15);

/**
 * Returns the file extension
 * @param {*} filename
 * @returns
 */
const getExtension = (file) => path.extname(file.originalname);

/**
 * Uploads a file
 * @param {*} files
 * @param {*} validExtensions
 * @param {*} folder
 * @returns
 */
const uploadFile = (
  files,
  validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'jfif'],
  folder = '',
) => new Promise((resolve, reject) => {
  const { sampleFile } = files;
  const splittedName = sampleFile.name.split('.');
  const extension = splittedName[splittedName.length - 1];

  if (!validExtensions.includes(extension)) {
    const msg = `The ${extension} extension, is not allowed: ${validExtensions}`;
    winstonLogger.error(msg);
    reject(new Error(msg));
  }

  const nameTemp = `${uuidv4()}.${extension}`;
  const uploadPath = path.join(
    __dirname,
    `..${process.env.UPLOADS_PATH}/`,
    folder,
    nameTemp,
  );

  sampleFile.mv(uploadPath, (err) => {
    if (err) {
      winstonLogger.error(err.message);
      reject(err);
    }
  });

  resolve(nameTemp);
});

module.exports = { uploadFile, getExtension, getTimestamp };
