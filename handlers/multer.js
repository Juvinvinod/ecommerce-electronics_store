const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const fs = require('fs');

// setting up storage options and checking if the file send is an image
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

// configure the files for uploading
const upload = multer(multerOptions).fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]);

// resize the images,create unique name, upload and send the name to next function
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

// configure the single image to be uploaded
const updateUpload = multer(multerOptions).single('photo');

// delete the existing image,create new image name,upload the image,and send the name to next function
const updateResize = async (req, res, next) => {
  if (!req.file) {
    const error = new Error('Photo not selected!');
    error.status = 400;
    next(error);
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
