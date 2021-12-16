var fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const storagePath = `${process.env.STORAGE_FOLDER}`;

function rotateVideo(folder, filename, angle) {
	const renamed = `_${filename}`;
	fs.renameSync(`${storagePath}/${folder}/${filename}`, `${storagePath}/${folder}/${renamed}`);

	let command = "";
	switch (angle) {
	case 90:
		command = "-vf \"transpose=1\"";
		break;
	case -90:
		command = "-vf \"transpose=2\"";
		break;
	case 180:
		command = "-vf \"transpose=2,transpose=2\"";
		break;
	}

	if(command)
		ffmpegCommand(`${folder}/${renamed}`, `${folder}/${filename}`, command);

	fs.unlinkSync(`${storagePath}/${folder}/${renamed}`);

}

function ffmpegCommand(input, output, options) {
	execSync(`docker run --rm -v ${path.resolve("./storage")}:/config linuxserver/ffmpeg -i /config/${input} ${options} /config/${output}`, (error, stdout, stderr) => {
		if(error) console.log("error => " + error);
		if(stdout) console.log("stdout => " + stdout);
		if(stderr) console.log("stderr => " + stderr);
	});
}

module.exports = {
	rotateVideo
};