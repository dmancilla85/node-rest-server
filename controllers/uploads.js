const { response } = require('express');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { uploadFile } = require('../helpers');
const { User, Product } = require('../models');
const winstonLogger = require('../middlewares');

cloudinary.config(process.env.CLOUDINARY_URL);

const isValidHttpUrl = (string) => {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

const uploadFiles = async (req, res = response) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded');
  }

  try {
    const fileName = await uploadFile(req.files);

    res.json({
      fileName,
    });
  } catch (error) {
    res.status(500).json({ msg: error });
  }

  return 0;
};

const updateImage = async (req, res = response) => {
  const { id, collection } = req.params;

  let model;

  switch (collection) {
    case 'users':
      model = await User.findById(id);

      if (!model) {
        return res.status(400).json({
          msg: `User with ${id} not exists`,
        });
      }
      break;

    case 'products':
      model = await Product.findById(id);

      if (!model) {
        return res.status(400).json({
          msg: `Product with ${id} not exists`,
        });
      }
      break;
    default:
      return res.status(500).json({ msg: 'Method not implemented' });
  }

  try {
    // remove old image from server
    if (model.img) {
      const imagePath = path.join(
        __dirname,
        '../uploads/',
        collection,
        model.img,
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
  } catch (error) {
    return res.status(500).json({ msg: error });
  }

  try {
    const fileName = await uploadFile(req.files, undefined, collection);

    model.img = fileName;
    await model.save();
  } catch (error) {
    return res.status(500).json({ msg: error });
  }

  return res.json(model);
};

const updateImageCloudinary = async (req, res = response) => {
  const { id, collection } = req.params;

  let model;

  switch (collection) {
    case 'users':
      model = await User.findById(id);

      if (!model) {
        return res.status(400).json({
          msg: `User with ${id} not exists`,
        });
      }
      break;

    case 'products':
      model = await Product.findById(id);

      if (!model) {
        return res.status(400).json({
          msg: `Product with ${id} not exists`,
        });
      }
      break;
    default:
      return res.status(500).json({ msg: 'Method not implemented' });
  }

  try {
    // remove old image from server
    if (model.img) {
      const nameArr = model.img.split('/');
      const name = nameArr[nameArr.length - 1];
      const [plublic_id] = name.split('.');
      cloudinary.uploader.destroy(plublic_id);
    }
  } catch (error) {
    return res.status(500).json({ msg: error });
  }

  try {
    const { tempFilePath } = req.files.sampleFile;
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath);

    model.img = secure_url;
    await model.save();
  } catch (error) {
    return res.status(500).json({ msg: error });
  }

  return res.json(model);
};

const getImage = async (req, res = response) => {
  const { id, collection } = req.params;

  let model;

  switch (collection) {
    case 'users':
      model = await User.findById(id);

      if (!model) {
        return res.status(400).json({
          msg: `User with ${id} not exists`,
        });
      }
      break;

    case 'products':
      model = await Product.findById(id);

      if (!model) {
        return res.status(400).json({
          msg: `Product with ${id} not exists`,
        });
      }
      break;
    default:
      return res.status(500).json({ msg: 'Method not implemented' });
  }

  try {
    // remove old image from server
    // TODO: fix this shit!!
    if (model.img) {
      if (isValidHttpUrl(model.img)) {
        await fetch(model.img)
          .then((resp) => resp.blob())
          .then(async (imageBlob) => {
            await fs.writeFile(
              'C:/sandbox/node/rest-server/uploads/users/temp.jpg',
              await imageBlob.arrayBuffer().then((arrayBuffer) => Buffer.from(arrayBuffer, 'binary')),
              (err) => {
                if (err) throw err;
                winstonLogger.info('File is created successfully.');
                return res.sendFile('C:/sandbox/node/rest-server/uploads/users/temp.jpg');
              },
            );
          });
      } else {
        const imagePath = path.join(
          __dirname,
          '../uploads/',
          collection,
          model.img,
        );

        if (fs.existsSync(imagePath)) {
          return res.sendFile(imagePath);
        }
      }
    }
  } catch (error) {
    return res.status(500).json({ msg: error });
  }

  /* try {
    const notFoundPath = path.join(__dirname, '../assets/', 'no-image.jpg');
    console.log('no hy archivo');
    if (fs.existsSync(notFoundPath)) {
      res.sendFile(notFoundPath);
    }
  } catch (error) {
    return res.status(500).json({ msg: error });
  } */
};

module.exports = {
  getImage, uploadFiles, updateImage, updateImageCloudinary,
};
