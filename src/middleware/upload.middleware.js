import multer from 'multer';

// default to 5MB, or allow override via environment variable
const MAX_SIZE = process.env.MAX_FILE_SIZE
  ? parseInt(process.env.MAX_FILE_SIZE, 10)
  : 5 * 1024 * 1024;

// configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // store files in memory (buffer) from GCS upload
  // limit file size to prevent abuse
  limits: {
    fileSize: MAX_SIZE,
  },
  // security: Validate that the uploaded file is actually an image
  fileFilter: (req, file, cb) => {
    // basic check. for stricter security, use 'file-type' library on the buffer later.
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      // reject non-image files
      const error = new Error('Only image files are allowed.');
      error.code = 'INVALID_FILE_TYPE'; // custom code for error handling
      // log the error for debugging
      cb(error, false);
    }
  },
});

export { upload };
