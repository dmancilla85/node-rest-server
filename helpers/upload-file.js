const path = require("path");
const { v4: uuidv4 } = require("uuid");

const uploadFile = (
  files,
  validExtensions = ["png", "jpg", "jpeg", "gif", "jfif"],
  folder = ""
) => {
  return new Promise((resolve, reject) => {
    const { sampleFile } = files;
    const splittedName = sampleFile.name.split(".");
    const extension = splittedName[splittedName.length - 1];

    if (!validExtensions.includes(extension)) {
      return reject(
        `The ${extension} extension, is not allowed: ${validExtensions}`
      );
    }

    const nameTemp = `${uuidv4()}.${extension}`;
    const uploadPath = path.join(__dirname, "../uploads/", folder, nameTemp);

    sampleFile.mv(uploadPath, (err) => {
      if (err) {
        reject(err);
      }
    });

    resolve(nameTemp);
  });
};
module.exports = { uploadFile };
