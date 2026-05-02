import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // 🔹 Validate mime type
  if (!file.mimetype.startsWith("image/")) {
    const error = new Error("Only image files (JPEG, PNG, GIF, WEBP) are allowed");
    error.status = 400;
    return cb(error, false);
  }

  // 🔹 Validate extension as a second layer
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
  if (!file.originalname.match(allowedExtensions)) {
    const error = new Error("Invalid file extension. Only .jpg, .jpeg, .png, .gif, .webp are allowed");
    error.status = 400;
    return cb(error, false);
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // Increased to 5MB for better user experience
    files: 1 // Only one file at a time
  },
});