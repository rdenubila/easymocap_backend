var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AnimationSchema = new Schema({
	name: { type: String, required: true },
	calibration: { type: String, required: true },
	persons: { type: String, required: true },
	folder: { type: String, required: true },
	description: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model("Animation", AnimationSchema);