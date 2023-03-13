const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

const { bufferToDataURI } = require('./dataURI');

dotenv.config({ path: './.env' });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRECT
});

const uploadToCloudinary = async (file, publicId, folder) => {
  const [, fileFormat] = file.originalname.split('.');
  const { base64 } = bufferToDataURI(fileFormat, file.buffer);

  const result = await cloudinary.uploader.upload(
    `data:image/${fileFormat};base64,${base64}`,
    {
      public_id: publicId,
      folder: `reviews-project/${folder}`
    }
  );

  return result;
};

module.exports = { uploadToCloudinary };
