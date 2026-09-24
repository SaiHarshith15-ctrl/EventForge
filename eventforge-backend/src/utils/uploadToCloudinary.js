const cloudinary = require('../config/cloudinary');

// Uploads an in-memory file buffer (from multer memoryStorage) to Cloudinary
const uploadBufferToCloudinary = (buffer, folder = 'eventforge') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
};

module.exports = uploadBufferToCloudinary;
