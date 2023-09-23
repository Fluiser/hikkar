const { Collection } = require('discord.js');
const fs = require('fs');
const patternCommand = {
	help: {
		name: [],
		usage: { en: 'en', ru: 'ru' },
		description: { en: 'en', ru: 'ru' },
		permissions: [],
		bot_permissions: [],
		owner: false,
		tag: 'string'
	}
};

module.exports = async function (__dir = '/commands') {
	const dir = process.mainModule.path + __dir;
	return new Promise((res, reject) => {
		let _ = new Collection();
		fs.readdir(dir, (err, path) => {
			if (err) return reject(err);
			path.filter(file => file.endsWith('.js')).forEach(file => {
				let file_name = file.split('.');
				// _.set(
				// 	file_name.slice(0, file_name.length - 1).join(''),
				// 	require(`${dir.endsWith('?') ? dir : dir + '/'}${file}`)
				// );
				const command = require(`${dir.endsWith('?') ? dir : dir + '/'}${file}`);
				for(const name of command.help.name)
				{
					_.set(name, command);
				}
			});
		});
		res(_);
	});
};
