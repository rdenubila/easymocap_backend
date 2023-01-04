const fs = require('fs');
const path = require('path');

exports.randomNumber = function (length) {
	var text = "";
	var possible = "123456789";
	for (var i = 0; i < length; i++) {
		var sup = Math.floor(Math.random() * possible.length);
		text += i > 0 && sup == i ? "0" : possible.charAt(sup);
	}
	return Number(text);
};

exports.listFolder = function (folder) {
	return fs.readdirSync(path.resolve(folder));
};

exports.deleteFile = function (filePath) {
	return fs.unlinkSync(path.resolve(filePath));
};

exports.renameFile = function (oldName, newName) {
	return fs.renameSync(path.resolve(oldName), path.resolve(newName));
};