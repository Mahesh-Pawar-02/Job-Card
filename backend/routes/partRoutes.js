const express = require("express");
const router = express.Router();
const { upload, multerErrorHandler } = require("../middleware/upload.js");
const {
  getAllParts,
  getPartById,
  createPart,
  updatePart,
  deleteMultipleParts,
  searchParts,
} = require("../controllers/partController.js");

// ✅ Create part with image1 & image2
router.post(
  "/",
  upload.fields([
    { name: "part_image", maxCount: 1 },
    { name: "charge_image", maxCount: 1 },
    { name: "drawing", maxCount: 1 },
  ]),
  createPart
);

// ✅ Update part with optional new images
router.put(
  "/:id",
  upload.fields([
    { name: "part_image", maxCount: 1 },
    { name: "charge_image", maxCount: 1 },
    { name: "drawing", maxCount: 1 },
  ]),
  updatePart
);

// Other routes (already done earlier)
router.get("/", getAllParts);
router.get("/:id", getPartById);
router.post("/search", searchParts);
router.delete("/", deleteMultipleParts);

router.use(multerErrorHandler)

module.exports = router;
