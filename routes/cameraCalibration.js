var express = require("express");
const CameraCalibration = require("../controllers/CameraCalibrationController");

var router = express.Router();

router.get("/", CameraCalibration.List);
router.get("/:id", CameraCalibration.Detail);
router.post("/", CameraCalibration.Store);
router.put("/:id", CameraCalibration.Update);
router.delete("/:id", CameraCalibration.Delete);

module.exports = router;