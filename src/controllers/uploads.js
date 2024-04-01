const { path, dirname } = require('path');

const appDir = dirname(require.main.filename);
const fs = require('fs');
const { response } = require('express');
const { StatusCodes } = require('http-status-codes');
const {
  usersService,
  productsService,
  cloudinaryService,
} = require('../services');
const { winstonLogger, createProblem, uploadFile } = require('../utils');

/**
 * Check if string is a valid URL
 * @param {*} string
 * @returns
 */
const isValidHttpUrl = (string) => {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

/**
 * Upload a file to server
 * @param {*} req
 * @param {*} res
 * @returns
 */
const uploadFiles = async (req, res = response) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    const msg = 'No files were uploaded';
    winstonLogger.warn(msg);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .set('Content-Type', 'application/problem+json')
      .json(
        ProblemDetails.create(
          'Some parameters are invalid.',
          msg,
          'https://example.com/collections/file-not-found',
          req.originalUrl,
          StatusCodes.BAD_REQUEST
        )
      );
  }

  try {
    const fileName = await uploadFile(req.files);

    res.status(StatusCodes.OK).json({
      fileName,
    });
  } catch (error) {
    winstonLogger.error(error.message);
    return createProblem(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      error.message,
      'https://example.com/collections/internal-error',
      req.originalUrl
    );
  }

  return 0;
};

/**
 * Update product or user local image
 * @param {*} req
 * @param {*} res
 * @returns
 */
const updateLocalImage = async (req, res = response) => {
  const { id, collection } = req.params;

  let model;

  switch (collection) {
    case 'users':
      model = await usersService.getById(id);

      if (!model) {
        const msg = `User with ${id} not exists`;
        winstonLogger.warn(msg);
        return createProblem(
          res,
          StatusCodes.BAD_REQUEST,
          'Some parameters are invalid.',
          msg,
          'https://example.com/collections/id-not-found',
          req.originalUrl
        );
      }
      break;

    case 'products':
      model = await productsService.getById(id);

      if (!model) {
        const msg = `Product with ${id} not exists`;
        winstonLogger.warn(msg);
        return createProblem(
          res,
          StatusCodes.BAD_REQUEST,
          'Some parameters are invalid.',
          msg,
          'https://example.com/collections/id-not-found',
          req.originalUrl
        );
      }
      break;
    default:
      return createProblem(
        res,
        StatusCodes.NOT_IMPLEMENTED,
        'Some parameters are invalid.',
        `Ups! Upload for ${collection} not implemented`,
        'https://example.com/collections/not-implemented',
        req.originalUrl
      );
  }

  try {
    // remove old image from server
    if (model.img) {
      const imagePath = path.join(
        __dirname,
        `..${process.env.UPLOADS_PATH}/`,
        collection,
        model.img
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
  } catch (error) {
    winstonLogger.error(error.message);
    return createProblem(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      error.message,
      'https://example.com/collections/internal-error',
      req.originalUrl
    );
  }

  try {
    const fileName = await uploadFile(req.files, undefined, collection);

    model.img = fileName;
    await model.save();
  } catch (error) {
    winstonLogger.error(error.message);
    return createProblem(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      error.message,
      'https://example.com/collections/internal-error',
      req.originalUrl
    );
  }

  return res.json(model);
};

/**
 * Update uploaded image in Cloudinary
 * @param {*} req
 * @param {*} res
 * @returns
 */
const updateImageCloudinary = async (req, res = response) => {
  const { id, collection } = req.params;

  let model;

  switch (collection) {
    case 'users':
      model = await usersService.getById(id);

      if (!model) {
        const msg = `User with ID ${id} not exists`;
        winstonLogger.warn(msg);
        return createProblem(
          res,
          StatusCodes.BAD_REQUEST,
          'Some parameters are invalid.',
          msg,
          'https://example.com/collections/id-not-found',
          req.originalUrl
        );
      }
      break;

    case 'products':
      model = await productsService.getById(id);

      if (!model) {
        const msg = `Product with ID ${id} not exists`;
        winstonLogger.warn(msg);
        return createProblem(
          res,
          StatusCodes.BAD_REQUEST,
          'Some parameters are invalid.',
          msg,
          'https://example.com/collections/id-not-found',
          req.originalUrl
        );
      }
      break;
    default:
      winstonLogger.warn('Method not implemented');
      return res
        .status(StatusCodes.NOT_IMPLEMENTED)
        .set('Content-Type', 'application/problem+json')
        .json(
          ProblemDetails.create(
            'Some parameters are invalid.',
            `Ups! Upload for ${collection} not implemented`,
            'https://example.com/collections/not-implemented',
            req.originalUrl,
            StatusCodes.NOT_IMPLEMENTED
          )
        );
  }

  try {
    // remove old image from server
    if (model.img) {
      if (!cloudinaryService.removeImage(model.img)) {
        throw new Error('Fail to remove image from Cloudinary');
      }
    }
  } catch (error) {
    winstonLogger.error(error.message);
    return createProblem(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      error.message,
      'https://example.com/collections/internal-error',
      req.originalUrl
    );
  }

  try {
    const { tempFilePath } = req.files.sampleFile;
    const { secure_url } = await cloudinaryService.uploadImage(tempFilePath);

    model.img = secure_url;
    await model.save();
  } catch (error) {
    winstonLogger.error(error.message);
    return createProblem(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      error.message,
      'https://example.com/collections/internal-error',
      req.originalUrl
    );
  }

  return res.status(StatusCodes.OK).json(model);
};

/**
 * Get a cloudinary or local image
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getImage = async (req, res = response) => {
  const { id, collection } = req.params;

  let model;

  switch (collection) {
    case 'users':
      model = await usersService.getById(id);

      if (!model) {
        const msg = `User with ID ${id} not exists`;
        winstonLogger.warn(msg);
        return createProblem(
          res,
          StatusCodes.BAD_REQUEST,
          'Some parameters are invalid.',
          msg,
          'https://example.com/collections/id-not-found',
          req.originalUrl
        );
      }
      break;

    case 'products':
      model = await productsService.getById(id);

      if (!model) {
        const msg = `Product with ID ${id} not exists`;
        winstonLogger.warn(msg);
        return createProblem(
          res,
          StatusCodes.BAD_REQUEST,
          'Some parameters are invalid.',
          msg,
          'https://example.com/collections/id-not-found',
          req.originalUrl
        );
      }
      break;
    default:
      winstonLogger.warn(`Method for ${collection} not implemented`);
      return createProblem(
        res,
        StatusCodes.NOT_IMPLEMENTED,
        'Some parameters are invalid.',
        `Ups! Upload for ${collection} not implemented`,
        'https://example.com/collections/not-implemented',
        req.originalUrl
      );
  }

  try {
    if (model.img) {
      const filename = model.img.split('/').pop();
      const filepath = `${appDir}${process.env.UPLOADS_PATH}/users/${filename}`;

      if (isValidHttpUrl(model.img)) {
        await fetch(model.img)
          .then((resp) => resp.blob())
          .then(async (imageBlob) => {
            fs.writeFile(
              filepath,
              await imageBlob
                .arrayBuffer()
                .then((arrayBuffer) => Buffer.from(arrayBuffer, 'binary')),
              (err) => {
                if (err) {
                  winstonLogger.error(err.message);
                  throw err;
                }
                winstonLogger.info(
                  `File ${filename} was obtained successfully.`
                );
                return res.status(StatusCodes.OK).sendFile(filepath);
              }
            );
          });
      } else {
        const imagePath = path.join(
          __dirname,
          `${appDir}${process.env.UPLOADS_PATH}/`,
          collection,
          model.img
        );

        if (fs.existsSync(imagePath)) {
          winstonLogger.info(`File ${filename} was obtained successfully.`);
          return res.status(StatusCodes.OK).sendFile(imagePath);
        }
      }
    }
  } catch (error) {
    winstonLogger.error(error.message);
    return createProblem(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      error.message,
      'https://example.com/collections/internal-error',
      req.originalUrl
    );
  }

  try {
    const notFoundPath = path.join(__dirname, '../assets/', 'no-image.jpg');
    const filename = model.img?.split('/').pop();

    winstonLogger.warn(`File not found: ${filename}`);
    if (fs.existsSync(notFoundPath)) {
      return res.status(StatusCodes.NOT_FOUND).sendFile(notFoundPath);
    }
  } catch (error) {
    winstonLogger.error(error.message);
    return createProblem(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      error.message,
      'https://example.com/collections/internal-error',
      req.originalUrl
    );
  }
};

module.exports = {
  getImage,
  uploadFiles,
  updateLocalImage,
  updateImageCloudinary,
};
