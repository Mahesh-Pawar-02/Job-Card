import multer from "multer";
import path from "path";

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/parts");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// File type check
function fileFilter(req, file, cb) {
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowed.includes(ext)) {
    return cb(new Error("Only JPG, PNG, WEBP or PDF files are allowed"));
  }
  cb(null, true);
}

// Multer instance with limits
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter,
});

// 🔥 Error handling middleware
export function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size exceeds 5MB limit" });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ error: "Unexpected file field uploaded" });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    // Custom/fileFilter errors
    return res.status(400).json({ error: err.message });
  }
  next();
}
