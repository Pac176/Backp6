
const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': '  jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const fileextension = MIME_TYPES[file.mimetype];
    const name = file.originalname.split('.' + fileextension.toString()).join('~');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      callback(null, true);
    } else {
      return callback(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
}).single('image');
