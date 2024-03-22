const { Router } = require('express');
const { validateJWT } = require('../middlewares');
const { sendFileToMongo, getFileFromMongoByName } = require('../controllers');

const router = Router();

router.get('/:filename', validateJWT, getFileFromMongoByName);

router.post('/', validateJWT, sendFileToMongo);

module.exports = router;
