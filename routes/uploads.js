const { Router } = require("express");
const { check } = require("express-validator");
const {
  uploadFiles,
  updateImage,
  getImage,
  updateImageCloudinary
} = require("../controllers/uploads");
const { collectionsAllowed } = require("../helpers");
const { validarCampos, validateFile } = require("../middlewares");
const router = Router();

router.get(
  "/:collection/:id",
  [
    check("id").isMongoId(),
    check("collection").custom((c) =>
      collectionsAllowed(c, ["users", "products"])
    ),
    validarCampos
  ],
  getImage
);

router.post("/", validateFile, uploadFiles);

router.put(
  "/:collection/:id",
  [
    validateFile,
    check("id").isMongoId(),
    check("collection").custom((c) =>
      collectionsAllowed(c, ["users", "products"])
    ),
    validarCampos
  ],
  updateImageCloudinary
  //updateImage
);

module.exports = router;
