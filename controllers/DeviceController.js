const Device = require("../models/DeviceModel");
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const path = `${process.env.STORAGE_FOLDER}${process.env.ANIMATION_FOLDER}/`;

// Device Schema
function DeviceData(data) {
	this.id = data._id;
	this.name = data.name;
	this.type = data.type;
	this.deviceId = data.deviceId;
	this.label = data.label;
	this.createdAt = data.createdAt;
}

/**
 * Device List.
 * 
 * @returns {Object}
 */
exports.List = [
	function (req, res) {
		try {
			Device.find({}).then((response) => {
				if (response.length > 0) {
					return apiResponse.successResponseWithData(res, "Operation success", response);
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

/**
 * Device Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.Detail = [
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Device.findOne({ _id: req.params.id }, "_id name persons description folder createdAt").then((animationData) => {
				if (animationData !== null) {
					let animationDataData = new DeviceData(animationData);
					return apiResponse.successResponseWithData(res, "Operation success", { ...animationDataData });
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Device store.
 * 
 * @param {string}      name 
 * @param {string}      calibration 
 * @param {string}      description 
 * 
 * @returns {Object}
 */
exports.Store = [
	body("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("name").escape(),
	(req, res) => {

		const { name, type, deviceId, label } = req.body;

		try {
			const errors = validationResult(req);
			var animationData = new Device(
				{
					name,
					type,
					deviceId,
					label
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save animationData.
				animationData.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let animationDataData = new DeviceData(animationData);
					return apiResponse.successResponseWithData(res, "Device add Success.", animationDataData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Device update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.Update = [
	(req, res) => {
		const { name, type, deviceId, label } = req.body;
		try {
			const errors = validationResult(req);
			var animationData = {
				name,
				type,
				deviceId,
				label
			};

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				} else {
					Device.findById(req.params.id, function (err, foundDevice) {
						if (foundDevice === null) {
							return apiResponse.notFoundResponse(res, "Device not exists with this id");
						} else {
							Device.findByIdAndUpdate(req.params.id, animationData, {}, function (err) {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								} else {
									let animationDataData = new DeviceData(animationData);
									return apiResponse.successResponseWithData(res, "Device update Success.", animationDataData);
								}
							});
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Device Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.Delete = [
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Device.findById(req.params.id, function (err, foundDevice) {
				if (foundDevice === null) {
					return apiResponse.notFoundResponse(res, "Device not exists with this id");
				} else {
					//delete animationData.
					Device.findByIdAndRemove(req.params.id, function (err) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						} else {
							return apiResponse.successResponse(res, "Device delete Success.");
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