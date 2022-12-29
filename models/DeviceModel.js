var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
	name: { type: String, required: true },
	type: { type: String, required: true },
	deviceId: { type: String, required: true },
	label: { type: String, required: true },
	status: { type: String, default: "created"},
}, { timestamps: true });

module.exports = mongoose.model("Device", DeviceSchema);