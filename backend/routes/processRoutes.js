const express = require("express");
const router = express.Router();
const processController = require("../controllers/processController");

router.get("/", processController.getAllProcesses);
router.get("/search", processController.searchProcesses);
router.get("/:id", processController.getProcessById);
router.post("/", processController.createProcess);
router.put("/:id", processController.updateProcess);
router.delete("/delete-multiple", processController.deleteMultipleProcesses);

module.exports = router;
