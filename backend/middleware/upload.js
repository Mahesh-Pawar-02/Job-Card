import multer from "multer";
import path from "path";

// Storage config: backend/uploads/parts
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/parts"); // Folder where images will be stored
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });
