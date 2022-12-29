var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
	name: { type: String, required: true },
	command: { type: String, required: true },
	log: { type: String },
	status: { type: String, default: "created" },
}, { timestamps: true });

module.exports = mongoose.model("Command", DeviceSchema);