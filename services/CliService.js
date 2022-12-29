const { exec } = require("child_process");
const { UpdateLog, UpdateStatus } = require("../controllers/Commandcontroller");


function runCommand(commandData) {
	UpdateStatus(commandData._id, "running");

	const execution = exec(commandData.command);

	execution.stdout.on("data", data => {
		console.log(`stdout: ${data}`);
		UpdateLog(commandData._id, data);
	});

	execution.stderr.on("data", data => {
		console.log(`stderr: ${data}`);
		UpdateLog(commandData._id, data);
	});

	execution.on("exit", function () {
		console.log("EXIT");
		UpdateStatus(commandData._id, "finished");
	});
}

module.exports = {
	runCommand
};