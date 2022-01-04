const { exec } = require("child_process");
const path = require("path");
//const storagePath = `${process.env.STORAGE_FOLDER}`;

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

	if(commands.length>0)
		ffmpegCommand(`${folder}/raw/${filename}`, `${folder}/videos/${filename}`, commands.join(" "));

}

function ffmpegCommand(input, output, options) {
	exec(`docker run --rm -v ${path.resolve("./storage")}:/config linuxserver/ffmpeg -i /config/${input} ${options} /config/${output}`, (error, stdout, stderr) => {
		if(error) console.log("error => " + error);
		if(stdout) console.log("stdout => " + stdout);
		if(stderr) console.log("stderr => " + stderr);
	});
}

module.exports = {
	convertVideo
};