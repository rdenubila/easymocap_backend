const fs = require('fs');

const calibration = `${process.env.STORAGE_FOLDER}${process.env.CALIBRATION_FOLDER}/`;
const animation = `${process.env.STORAGE_FOLDER}${process.env.ANIMATION_FOLDER}/`;

const hasContent = (folder) => {
	return fs.existsSync(folder) && fs.readdirSync(folder).length > 0;
};

const calibrationStatus = (folder) => {
	return {
		intri: {
			raw: hasContent(`${calibration}${folder}/intri/raw`),
			videos: hasContent(`${calibration}${folder}/intri/videos`),
			images: hasContent(`${calibration}${folder}/intri/images`),
			chessboard: hasContent(`${calibration}${folder}/intri/chessboard`),
		},
		extri: {
			raw: hasContent(`${calibration}${folder}/extri/raw`),
			videos: hasContent(`${calibration}${folder}/extri/videos`),
			images: hasContent(`${calibration}${folder}/extri/images`),
			chessboard: hasContent(`${calibration}${folder}/extri/chessboard`),
		}
	};
};

const animationStatus = (folder) => {
	return {
		raw: hasContent(`${animation}${folder}/raw`),
		videos: hasContent(`${animation}${folder}/videos`),
		images: hasContent(`${animation}${folder}/images`),
		openpose: hasContent(`${animation}${folder}/annots`) || hasContent(`${animation}${folder}/openpose`),
		smpl: hasContent(`${animation}${folder}/output/smpl/smpl`),
		bvh: hasContent(`${animation}${folder}/output/bvh`),
	};
};

module.exports = {
	calibrationStatus,
	animationStatus
};