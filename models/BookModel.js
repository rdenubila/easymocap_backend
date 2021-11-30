var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BookSchema = new Schema({
	title: {type: String, required: true},
	description: {type: String, required: true},
	isbn: {type: String, required: true},
}, {timestamps: true});

module.exports = mongoose.model("Book", BookSchema);