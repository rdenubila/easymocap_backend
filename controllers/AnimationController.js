const Animation = require("../models/AnimationModel");
const fs = require('fs');
const { body,validationResult } = require("express-validator");
const slugify = require("slugify");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const path = `${process.env.STORAGE_FOLDER}${process.env.ANIMATION_FOLDER}/`;

// Animation Schema
function AnimationData(data) {
	this.id = data._id;
	this.name= data.name;
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
			Animation.find({}).then((response)=>{
				if(response.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", response);
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
 * Animation Detail.
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
			Animation.findOne({_id: req.params.id},"_id name folder createdAt").then((animationData)=>{                
				if(animationData !== null){
					let animationDataData = new AnimationData(animationData);
					return apiResponse.successResponseWithData(res, "Operation success", animationDataData);
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
		const {name, calibration, description} = req.body;
		const folder = slugify(name);
		if (!fs.existsSync(path+folder)){
			fs.mkdirSync(path+folder, { recursive: true });
		}
		try {
			const errors = validationResult(req);
			var animationData = new Animation(
				{ 
					name,
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
					return apiResponse.successResponseWithData(res,"Animation add Success.", animationDataData);
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
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Animation.findOne({isbn : value,user: req.user._id, _id: { "$ne": req.params.id }}).then(animationData => {
			if (animationData) {
				return Promise.reject("Animation already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var animationData = new Animation(
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
					Animation.findById(req.params.id, function (err, foundAnimation) {
						if(foundAnimation === null){
							return apiResponse.notFoundResponse(res,"Animation not exists with this id");
						}else{
							//Check authorized user
							if(foundAnimation.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								//update animationData.
								Animation.findByIdAndUpdate(req.params.id, animationData, {},function (err) {
									if (err) { 
										return apiResponse.ErrorResponse(res, err); 
									}else{
										let animationDataData = new AnimationData(animationData);
										return apiResponse.successResponseWithData(res,"Animation update Success.", animationDataData);
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
 * Animation Delete.
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
			Animation.findById(req.params.id, function (err, foundAnimation) {
				if(foundAnimation === null){
					return apiResponse.notFoundResponse(res,"Animation not exists with this id");
				}else{
					//delete animationData.
					Animation.findByIdAndRemove(req.params.id,function (err) {
						if (err) { 
							return apiResponse.ErrorResponse(res, err); 
						}else{
							return apiResponse.successResponse(res,"Animation delete Success.");
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