var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AnimationSchema = new Schema({
	name: { type: String, required: true },
	folder: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Animation", AnimationSchema);