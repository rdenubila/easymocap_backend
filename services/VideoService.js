const { exec } = require("child_process");
const path = require("path");
const fs = require('fs');

//const storagePath = `${process.env.STORAGE_FOLDER}`;
const Command = require("../controllers/CommandController");

const easymocapImageName = "easymocap"
const pythonVersion = "python3.7"

function convertVideo(folder, filename, options) {
	const commands = ["-filter:v fps=30"];

	switch (options.rotation) {
		case 90:
			commands.push("-vf \"transpose=1\"");
			break;
		case -90:
			commands.push("-vf \"transpose=2\"");
			break;
		case 180:
			commands.push("-vf \"transpose=2,transpose=2\"");
			break;
	}

	if (commands.length > 0)
		saveFfmpegCommand(`${folder}/raw/${filename}`, `${folder}/videos/${filename}`, commands.join(" "), folder, filename);

}


function saveFfmpegCommand(input, output, options, folder, filename) {
	const command = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/config linuxserver/ffmpeg -i /config/${input} ${options} /config/${output}`;
	Command.Store(`Convert video: ${folder}/${filename}`, command);
}


function extractVideo(folder, openpose = false) {
	if(!openpose) {
		const command = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage ${easymocapImageName} ${pythonVersion} apps/preprocess/extract_image.py /usr/src/easymocap/storage/${folder}`;
		Command.Store(`Extract video: ${folder}`, command);
	} else {
		const command2 = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage ${easymocapImageName} ${pythonVersion} apps/preprocess/extract_keypoints.py /usr/src/easymocap/storage/${folder} --mode mp-holistic`;
		Command.Store(`Extract keypoints: ${folder}`, command2);
	}
}

function smplReconstruction(folder, type, start, end) {
	const data = `/usr/src/easymocap/storage/${folder}`;

	let command;
	// if (type === "multiple") {
	// } else {
	// 	command = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage ${easymocapImageName} ${pythonVersion} apps/demo/mvmp.py ${data} --out ${data}/output --annot annots --cfg config/exp/mvmp1f.yml --vis_det --vis_repro --undis`;
	// }
	command = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage ${easymocapImageName} ${pythonVersion} apps/demo/mv1p.py ${data} --out ${data}/output/smpl --vis_det --vis_repro --undis`;

	if (start > 0) command = `${command}  --start=${start}`;
	if (end > 0) command = `${command}  --end=${end}`;

	Command.Store(`SMPL Reconstruction: ${folder}`, command);
}

function exportBvh(folder) {
	console.log(path.resolve("./storage") + "/" + folder + "/output/bvh");
	fs.mkdirSync(path.resolve("./storage") + "/" + folder + "/output/bvh", { recursive: true });
	const data = `/usr/src/easymocap/storage/${folder}`;
	const command = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage ${easymocapImageName} /blender/blender -b -t 12 -P scripts/postprocess/convert2bvh-fixed.py -- ${data}/output/smpl/smpl --o ${data}/output/bvh`;
	Command.Store(`Export BVH: ${folder}`, command);
}

async function detectChessboard(folder) {
	const intri = `/usr/src/easymocap/storage/${folder}/intri`;
	const extri = `/usr/src/easymocap/storage/${folder}/extri`;

	const commandIntri = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage ${easymocapImageName} ${pythonVersion} apps/calibration/detect_chessboard.py ${intri} --out ${intri}/output/calibration --pattern 9,6 --grid 0.156`;
	await Command.Store(`Calibration - Detect chessboard (Intri): ${folder}`, commandIntri);

	const commandExtri = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage ${easymocapImageName} ${pythonVersion} apps/calibration/detect_chessboard.py ${extri} --out ${extri}/output/calibration --pattern 9,6 --grid 0.156`;
	await Command.Store(`Calibration - Detect chessboard (Extri): ${folder}`, commandExtri);
}

async function calibration(folder) {
	const intri = `/usr/src/easymocap/storage/${folder}/intri`;
	const extri = `/usr/src/easymocap/storage/${folder}/extri`;
	const intriCommand = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage ${easymocapImageName} ${pythonVersion} apps/calibration/calib_intri.py ${intri}`;
	await Command.Store(`Calibration - Intrinsic Parameters: ${folder}`, intriCommand);

	const extriCommand = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage ${easymocapImageName} ${pythonVersion} apps/calibration/calib_extri.py ${extri} --intri ${intri}/output/intri.yml`;
	await Command.Store(`Calibration - Extrinsic Parameters: ${folder}`, extriCommand);
}

module.exports = {
	convertVideo,
	extractVideo,
	detectChessboard,
	calibration,
	smplReconstruction,
	exportBvh
};