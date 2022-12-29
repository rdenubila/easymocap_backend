var express = require("express");
const CameraCalibration = require("../controllers/CameraCalibrationController");

var router = express.Router();

router.get("/", CameraCalibration.List);
router.get("/:id", CameraCalibration.Detail);
router.post("/", CameraCalibration.Store);
router.put("/:id", CameraCalibration.Update);
router.post("/:id/extract", CameraCalibration.ExtractVideos);
router.post("/:id/chessboard", CameraCalibration.DetectChessboard);
router.post("/:id/calibrate", CameraCalibration.CalibrationCommands);
router.delete("/:id", CameraCalibration.Delete);

module.exports = router;