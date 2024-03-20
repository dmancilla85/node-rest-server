const { Router } = require('express');
const { check } = require('express-validator');
const {
  uploadFiles,
  getImage,
  updateImageCloudinary,
  updateLocalImage,
} = require('../controllers');
const { collectionsAllowed } = require('../utils');
const { validateFields, validateFile, diskStorage } = require('../middlewares');

const router = Router();

router.get(
  '/:collection/:id',
  [
    check('id').isMongoId(),
    check('collection').custom((c) => collectionsAllowed(c, ['users', 'products'])),
    validateFields,
  ],
  getImage,
);

router.post('/', validateFile, diskStorage, uploadFiles);

router.put(
  '/:collection/:id',
  [
    validateFile,
    check('id').isMongoId(),
    check('collection').custom((c) => collectionsAllowed(c, ['users', 'products'])),
    validateFields,
  ],
  updateLocalImage,
);

router.put(
  '/cloud/:collection/:id',
  [
    validateFile,
    check('id').isMongoId(),
    check('collection').custom((c) => collectionsAllowed(c, ['users', 'products'])),
    validateFields,
  ],
  updateImageCloudinary,
);

module.exports = router;
