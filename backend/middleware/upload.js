import multer from "multer";
import path from "path";

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/parts");
  },
  filename: (req, file, cb) => {
    const { customer, name, no } = req.body;

    // 🔥 req.body मध्ये values नसेल तर थेट error
    if (!customer || !name || !no) {
      return cb(new Error("customer, part_name आणि part_no required आहेत for uploading files"));
    }

    // 4-5 random chars based on time
    const random = Date.now().toString(36).slice(-5);

    const finalName = `${customer}_${name}_${no}_${random}${path.extname(
      file.originalname
    )}`;

    cb(null, finalName);
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
