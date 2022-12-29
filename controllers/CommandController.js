const Command = require("../models/CommandModel");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const apiResponse = require("../helpers/apiResponse");
const { runCommand } = require("../services/CliService");

exports.List = [
	function (req, res) {
		try {
			Command.find({}).sort({createdAt: -1}).then((data) => {
				if (data.length > 0) {
					return apiResponse.successResponseWithData(res, "Operation success", data);
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.Detail = [
	function (req, res) {
		try {
			Command.findById(req.params.id).then((data) => {
				if (data) {
					return apiResponse.successResponseWithData(res, "Operation success", data);
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", null);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.Store = async (name, command) => {
	try {
		const newCommand = new Command({ name, command });
		await newCommand.save();
	} catch (err) {
		throw "Cannot add command";
	}
};


exports.Delete = [
	function (req, res) {
		try {
			Command.findById(req.params.id, function (err, foundCommand) {
				if (foundCommand === null) {
					return apiResponse.notFoundResponse(res, "Command not exists with this id");
				} else {
					//delete cameraCalibration.
					Command.findByIdAndRemove(req.params.id, function (err) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						} else {
							return apiResponse.successResponse(res, "Command delete Success.");
						}
					});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.UpdateLog = async (id, message) => {
	try {
		const data = await Command.findById(id);
		await Command.findByIdAndUpdate(id, {
			log: `${data.log || ""}${message}`
		});
	} catch (err) {
		throw "Cannot add command";
	}
};

exports.UpdateStatus = async (id, status) => {
	try {
		await Command.findByIdAndUpdate(id, { status });
	} catch (err) {
		throw "Cannot add command";
	}
};

exports.Run = [
	function (req, res) {
		const { id } = req.params;
		try {
			Command.findById(id).then((data) => {
				runCommand(data);
				return apiResponse.successResponseWithData(res, "Operation success", data);
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];