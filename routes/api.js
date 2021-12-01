var express = require("express");
var authRouter = require("./auth");
var cameraCalibrationRouter = require("./cameraCalibration");
var animationRouter = require("./animation");
var videoRouter = require("./video");

var app = express();

app.use("/auth/", authRouter);
app.use("/animation/", animationRouter);
app.use("/camera-calibration/", cameraCalibrationRouter);
app.use("/video/", videoRouter);

module.exports = app;