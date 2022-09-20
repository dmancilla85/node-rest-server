const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { winstonLogger } = require('./winston-logger');

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
    reject(
      new Error(msg),
    );
  }

  const nameTemp = `${uuidv4()}.${extension}`;
  const uploadPath = path.join(__dirname, '../uploads/', folder, nameTemp);

  sampleFile.mv(uploadPath, (err) => {
    if (err) {
      winstonLogger.error(err.message);
      reject(err);
    }
  });

  resolve(nameTemp);
});

module.exports = { uploadFile };
