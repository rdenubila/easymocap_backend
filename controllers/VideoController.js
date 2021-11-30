const fs = require("fs");
const path = `${process.env.STORAGE_FOLDER}`;
const apiResponse = require("../helpers/apiResponse");

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
				return apiResponse.successResponseWithData(res, "Temp video created", {
					filename
				});
			}
		});

	}
];
