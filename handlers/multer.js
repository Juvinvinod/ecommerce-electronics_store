const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const fs = require('fs');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That file type is not allowed' }, false);
    }
  },
};

const upload = multer(multerOptions).fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]);

const resize = async (req, res, next) => {
  if (!req.files) {
    next();
    return;
  }
  const fileFieldNames = Object.keys(req.files);

  for (const fieldName of fileFieldNames) {
    const file = req.files[fieldName][0];
    const extension = file.mimetype.split('/')[1];
    req.body[fieldName] = `${uuid.v4()}.${extension}`;

    const photo = await jimp.read(file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body[fieldName]}`);
  }
  // now we resize
  // once we have written the photo to our filesystem,keep going!
  next();
};

const updateUpload = multer(multerOptions).single('photo');

const updateResize = async (req, res, next) => {
  if (!req.file) {
    next();
  }
  const existingFileName = req.body.existingImageField;
  await fs.promises.unlink(`./public/uploads/${existingFileName}`);
  const extension = req.file.mimetype.split('/')[1];
  req.body.image = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.image}`);
  next();
};

module.exports = {
  upload,
  resize,
  updateUpload,
  updateResize,
};
