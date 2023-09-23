const fs = require('fs');

for (let dir of fs
	.readdirSync(__dirname + '/')
	.filter(file => file !== 'index.js' && (file.endsWith('.js') || file.endsWith('.json')))) {
	let fileName = dir.split('.');
	fileName.pop();
	fileName = fileName.join('.');
	module.exports[fileName] = require('./' + dir);
}
