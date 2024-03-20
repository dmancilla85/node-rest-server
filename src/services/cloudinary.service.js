const cloudinary = require('cloudinary').v2;
const { winstonLogger } = require('../utils');

class CloudinaryService {
  constructor() {
    // TODO: test whether it works
    cloudinary.config(process.env.CLOUDINARY_URL);
    this.logger = winstonLogger;
  }

  removeImage(imgUrl) {
    try {
      const nameArr = imgUrl.split('/');
      const name = nameArr[nameArr.length - 1];
      const [public_id] = name.split('.');
      cloudinary.uploader.destroy(public_id);
      return true;
    } catch (error) {
      this.logger.error(`Can't remove image from Cloudinary: ${error.message}`);
      return false;
    }
  }

  async uploadImage(filePath) {
    try {
      const [public_id] = filePath.split('.');
      return cloudinary.uploader.upload(filePath, { public_id });
    } catch (error) {
      this.logger.error(`Can't remove image from Cloudinary: ${error.message}`);
      return undefined;
    }
  }
}

const service = new CloudinaryService();
module.exports = service;
