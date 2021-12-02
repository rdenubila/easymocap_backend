const Animation = require("../models/AnimationModel");
const fs = require('fs');
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const path = `${process.env.STORAGE_FOLDER}${process.env.ANIMATION_FOLDER}/`;

// Animation Schema
function AnimationData(data) {
	this.id = data._id;
	this.name = data.name;
	this.persons = data.persons;
	this.folder = data.folder;
	this.description = data.description;
	this.createdAt = data.createdAt;
}

/**
 * Animation List.
 * 
 * @returns {Object}
 */
exports.List = [
	function (req, res) {
		try {
			Animation.find({}).then((response) => {
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
 * Animation Detail.
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
			Animation.findOne({ _id: req.params.id }, "_id name persons description folder createdAt").then((animationData) => {
				if (animationData !== null) {

					const videos = [];

					fs.readdirSync(`${path}${animationData.folder}/videos`).forEach(file => {
						videos.push(file);
					});

					let animationDataData = new AnimationData(animationData);
					return apiResponse.successResponseWithData(res, "Operation success", { ...animationDataData, ...{ videos } });
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
 * Animation store.
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

		const { name, persons, calibration, description } = req.body;
		const folderRaw = slugify(name);
		let folder = slugify(name);

		let i = 1;
		while (fs.existsSync(path + folder)) {
			folder = `${folderRaw}-${i}`;
			i++;
		}

		if (!fs.existsSync(path + folder)) {
			fs.mkdirSync(path + folder, { recursive: true });
		}

		try {
			const errors = validationResult(req);
			var animationData = new Animation(
				{
					name,
					persons,
					calibration,
					description,
					folder
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save animationData.
				animationData.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let animationDataData = new AnimationData(animationData);
					return apiResponse.successResponseWithData(res, "Animation add Success.", animationDataData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Animation update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.Update = [
	(req, res) => {
		const { name, persons, calibration, description } = req.body;
		try {
			const errors = validationResult(req);
			var animationData = {
				name,
				persons,
				calibration,
				description,
			};

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				} else {
					Animation.findById(req.params.id, function (err, foundAnimation) {
						if (foundAnimation === null) {
							return apiResponse.notFoundResponse(res, "Animation not exists with this id");
						} else {
							Animation.findByIdAndUpdate(req.params.id, animationData, {}, function (err) {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								} else {
									let animationDataData = new AnimationData(animationData);
									return apiResponse.successResponseWithData(res, "Animation update Success.", animationDataData);
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
 * Animation Delete.
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
			Animation.findById(req.params.id, function (err, foundAnimation) {
				if (foundAnimation === null) {
					return apiResponse.notFoundResponse(res, "Animation not exists with this id");
				} else {
					//delete animationData.
					Animation.findByIdAndRemove(req.params.id, function (err) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						} else {
							return apiResponse.successResponse(res, "Animation delete Success.");
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