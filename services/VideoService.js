const { exec } = require("child_process");
const path = require("path");
const fs = require('fs');

//const storagePath = `${process.env.STORAGE_FOLDER}`;
const Command = require("../controllers/CommandController");

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
	const command = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage rdenubila/easymocap python3 scripts/preprocess/extract_video.py /usr/src/easymocap/storage/${folder} ${openpose ? " --openpose /openpose" : "--no2d"}`;
	Command.Store(`Extract video: ${folder}`, command);
}

function smplReconstruction(folder, type, start, end) {
	const data = `/usr/src/easymocap/storage/${folder}`;

	let command;
	if (type === "multiple") {
		command = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage rdenubila/easymocap python3 apps/demo/mv1p.py ${data} --out ${data}/output/smpl --vis_det --vis_repro --undis`;
	} else {
		command = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage rdenubila/easymocap python3 apps/demo/mvmp.py ${data} --out ${data}/output --annot annots --cfg config/exp/mvmp1f.yml --vis_det --vis_repro --undis`;
	}

	if (start > 0) command = `${command}  --start=${start}`;
	if (end > 0) command = `${command}  --end=${end}`;

	Command.Store(`SMPL Reconstruction: ${folder}`, command);
}

function exportBvh(folder) {
	console.log(path.resolve("./storage") + "/" + folder + "/output/bvh");
	fs.mkdirSync(path.resolve("./storage") + "/" + folder + "/output/bvh", { recursive: true });
	const data = `/usr/src/easymocap/storage/${folder}`;
	const command = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage rdenubila/easymocap /blender/blender -b -t 12 -P scripts/postprocess/convert2bvh.py -- ${data}/output/smpl/smpl --o ${data}/output/bvh`;
	Command.Store(`Export BVH: ${folder}`, command);
}

async function detectChessboard(folder) {
	const intri = `/usr/src/easymocap/storage/${folder}/intri`;
	const extri = `/usr/src/easymocap/storage/${folder}/extri`;

	const commandIntri = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage rdenubila/easymocap python3 apps/calibration/detect_chessboard.py ${intri} --out ${intri}/output/calibration --pattern 9,6 --grid 0.156`;
	await Command.Store(`Calibration - Detect chessboard (Intri): ${folder}`, commandIntri);

	const commandExtri = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage rdenubila/easymocap python3 apps/calibration/detect_chessboard.py ${extri} --out ${extri}/output/calibration --pattern 9,6 --grid 0.156`;
	await Command.Store(`Calibration - Detect chessboard (Extri): ${folder}`, commandExtri);
}

async function calibration(folder) {
	const intri = `/usr/src/easymocap/storage/${folder}/intri`;
	const extri = `/usr/src/easymocap/storage/${folder}/extri`;
	const intriCommand = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage rdenubila/easymocap python3 apps/calibration/calib_intri.py ${intri} --step 5 `;
	await Command.Store(`Calibration - Intrinsic Parameters: ${folder}`, intriCommand);

	const extriCommand = `docker run --rm --gpus all -v ${path.resolve("./storage")}:/usr/src/easymocap/storage rdenubila/easymocap python3 apps/calibration/calib_extri.py ${extri} --intri ${intri}/output/intri.yml`;
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