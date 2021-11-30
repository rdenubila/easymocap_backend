var express = require("express");
const Video = require("../controllers/VideoController");

var router = express.Router();

router.post("/save", Video.saveVideo);

module.exports = router;