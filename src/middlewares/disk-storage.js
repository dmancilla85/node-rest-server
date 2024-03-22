const fileUpload = require('express-fileupload');

// uploads
const diskStorage = () => {
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    createParentPath: true,
  });
};

module.exports = { diskStorage };
