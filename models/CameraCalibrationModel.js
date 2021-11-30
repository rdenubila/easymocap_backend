var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CameraConfigSchema = new Schema({
	name: { type: String, required: true },
	folder: { type: String, required: true },
	cameras: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("CameraCalibration", CameraConfigSchema);