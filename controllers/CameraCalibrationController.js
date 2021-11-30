const CameraCalibration = require("../models/CameraCalibrationModel");
const fs = require('fs');
const { body,validationResult } = require("express-validator");
const slugify = require("slugify");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const path = `${process.env.STORAGE_FOLDER}${process.env.CALIBRATION_FOLDER}/`;

// CameraCalibration Schema
function CameraCalibrationData(data) {
	this.id = data._id;
	this.name= data.name;
	this.folder = data.folder;
	this.cameras = data.cameras;
	this.createdAt = data.createdAt;
}

/**
 * CameraCalibration List.
 * 
 * @returns {Object}
 */
exports.List = [
	function (req, res) {
		try {
			CameraCalibration.find({}).then((cameraCalibrations)=>{
				if(cameraCalibrations.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", cameraCalibrations);
				}else{
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
 * CameraCalibration Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.Detail = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			CameraCalibration.findOne({_id: req.params.id},"_id name folder cameras createdAt").then((cameraCalibration)=>{                
				if(cameraCalibration !== null){
					let cameraCalibrationData = new CameraCalibrationData(cameraCalibration);
					return apiResponse.successResponseWithData(res, "Operation success", cameraCalibrationData);
				}else{
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
 * CameraCalibration store.
 * 
 * @param {string}      name 
 * @param {array}       cameras
 * 
 * @returns {Object}
 */
exports.Store = [
	body("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("name").escape(),
	(req, res) => {
		const {name, cameras} = req.body;
		const folder = slugify(name);
		if (!fs.existsSync(path+folder)){
			fs.mkdirSync(path+folder, { recursive: true });
		}
		try {
			const errors = validationResult(req);
			var cameraCalibration = new CameraCalibration(
				{ 
					name,
					folder,
					cameras
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save cameraCalibration.
				cameraCalibration.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let cameraCalibrationData = new CameraCalibrationData(cameraCalibration);
					return apiResponse.successResponseWithData(res,"CameraCalibration add Success.", cameraCalibrationData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * CameraCalibration update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.Update = [
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return CameraCalibration.findOne({isbn : value,user: req.user._id, _id: { "$ne": req.params.id }}).then(cameraCalibration => {
			if (cameraCalibration) {
				return Promise.reject("CameraCalibration already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var cameraCalibration = new CameraCalibration(
				{ title: req.body.title,
					description: req.body.description,
					isbn: req.body.isbn,
					_id:req.params.id
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					CameraCalibration.findById(req.params.id, function (err, foundCameraCalibration) {
						if(foundCameraCalibration === null){
							return apiResponse.notFoundResponse(res,"CameraCalibration not exists with this id");
						}else{
							//Check authorized user
							if(foundCameraCalibration.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								//update cameraCalibration.
								CameraCalibration.findByIdAndUpdate(req.params.id, cameraCalibration, {},function (err) {
									if (err) { 
										return apiResponse.ErrorResponse(res, err); 
									}else{
										let cameraCalibrationData = new CameraCalibrationData(cameraCalibration);
										return apiResponse.successResponseWithData(res,"CameraCalibration update Success.", cameraCalibrationData);
									}
								});
							}
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
 * CameraCalibration Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.Delete = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			CameraCalibration.findById(req.params.id, function (err, foundCameraCalibration) {
				if(foundCameraCalibration === null){
					return apiResponse.notFoundResponse(res,"CameraCalibration not exists with this id");
				}else{
					//delete cameraCalibration.
					CameraCalibration.findByIdAndRemove(req.params.id,function (err) {
						if (err) { 
							return apiResponse.ErrorResponse(res, err); 
						}else{
							return apiResponse.successResponse(res,"CameraCalibration delete Success.");
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