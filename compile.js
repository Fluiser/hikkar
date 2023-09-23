let compileFiles = process.argv.slice(2);
compileFiles = compileFiles.length
	? (() => {
			let index = {};
			for (let i = 2; i < process.argv.length; ++i) {
				if (process.argv[i].startsWith('-')) index[process.argv[i].slice(1)] = process.argv[++i];
			}
			return [index];
	  })()
	: require('./binding.json');
let { readFileSync, writeFileSync } = require('fs');
let pattern = readFileSync('./CMakeLists_pattern.txt') + '';

const { exec } = require('child_process');
const exe = cmd =>
	new Promise(res => {
		exec(cmd, (error, out) => {
			res(error || out !== 'null' ? out : null);
		});
	});

(async () => {
	for (let source of compileFiles) {
		writeFileSync(
			'./CMakeLists.txt',
			pattern
				.replace(
					'%__TEMPLATE__VALUE__%',
					typeof source.path === 'string' ? `"${source.path}"` : source.map(s => `"${s}"`).join(' ')
				)
				.replace('__output_file__', source.name)
		);
		console.log(await exe('cmake-js compile'));
		//if(process.platform === 'linux') exe('rm CMakeLists.txt');
	}
})();
