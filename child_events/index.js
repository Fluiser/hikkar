const { readdir } = require('fs');

module.exports = function (client) {
	readdir(__dirname, function (err, dirs) {
		for (const path of dirs.filter(file => file !== 'index.js')) {
			if (!path.endsWith('.js')) continue;
			const _data = require('./' + path);
			switch (true) {
				case Array.isArray(_data):
					for (const _d of _data) {
						if (_d.event && _d.run) client.on(_d.event, _d.run);
					}
					break;
				case Boolean(_data.exe && _data.event):
					client.on(_data.event, _data.run);
					break;
				default:
					console.log(`child_events::${path} is not correct event file.`);
					break;
			}
		}
	});
};
