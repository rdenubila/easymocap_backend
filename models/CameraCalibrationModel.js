var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CameraConfigSchema = new Schema({
	name: { type: String, required: true },
	description: { type: String },
	grid: { type: String },
	pattern: { type: String },
	folder: { type: String, required: true },
	cameras: [{ type: Object }],
}, { timestamps: true });

module.exports = mongoose.model("CameraCalibration", CameraConfigSchema);