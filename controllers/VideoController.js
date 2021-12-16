const fs = require("fs");
const path = `${process.env.STORAGE_FOLDER}`;
const apiResponse = require("../helpers/apiResponse");
const { rotateVideo } = require("../services/VideoService");

/**
 * Video
 * 
 * @returns {Object}
 */
exports.saveVideo = [
	function (req, res) {
		fs.mkdirSync(`${path}/${req.body.dir}`, { recursive: true });
		const filename = `${path}/${req.body.dir}/${req.body.camId}.mp4`;
		let base64Video = req.body.video.split(";base64,").pop();
		fs.writeFile(filename, base64Video, { encoding: "base64" }, function (err) {
			if (err) {
				return apiResponse.ErrorResponse(res, err);
			} else {

				if (req.body.rotation)
					rotateVideo(req.body.dir, `${req.body.camId}.mp4`, req.body.rotation);
					
				return apiResponse.successResponseWithData(res, "video created", {
					filename
				});
			}
		});

	}
];
