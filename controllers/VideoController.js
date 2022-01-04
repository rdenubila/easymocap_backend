const fs = require("fs");
const path = `${process.env.STORAGE_FOLDER}`;
const apiResponse = require("../helpers/apiResponse");
const { convertVideo } = require("../services/VideoService");

/**
 * Video
 * 
 * @returns {Object}
 */
exports.saveVideo = [
	function (req, res) {
		const destinationRaw = `${path}/${req.body.dir}/raw/`;
		const destinationVideo = `${path}/${req.body.dir}/videos/`;

		fs.mkdirSync(`${destinationRaw}`, { recursive: true });
		fs.mkdirSync(`${destinationVideo}`, { recursive: true });

		const filename = `${destinationRaw}/${req.body.camId}.mp4`;
		let base64Video = req.body.video.split(";base64,").pop();
		fs.writeFile(filename, base64Video, { encoding: "base64" }, function (err) {
			if (err) {
				return apiResponse.ErrorResponse(res, err);
			} else {

				convertVideo(req.body.dir, `${req.body.camId}.mp4`, {
					rotation: req.body.rotation
				});

				return apiResponse.successResponseWithData(res, "video created", {
					filename
				});
			}
		});

	}
];
