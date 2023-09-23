process.scr = {};
process.json = {
	locales: require('../../json/locales.json'),
	miners: require('../../json/miners.json'),
	items: require('../../json/items.json')
};

process.scr = {
	locales: process.json.locales,
	sql: require('../../dist/script/sql.js'),
	sqlPatterns: require('../../dist/script/sqlPatterns.js'),
	utils: require('../../dist/script/utils.js'),
	ytStream: require('../../dist/script/ytStream.js'),
	logger: require('./logger.js'),
	embeds: require('../embeds.js'),
	ruPermissions: require('../ruPermissions.js'),
	instruction: {
		clan: require('../../dist/instruction/clan.js'),
		miner: require('../../dist/instruction/miner.js'),
		osu: require('../../dist/instruction/osu.js'),
		player: require('../../dist/instruction/player.js'),
		playlist: require('../../dist/instruction/playlist.js'),
		ytApi: require('../../dist/instruction/ytApi.js'),
		images: require('../instruction/images.js'),
		mute: require('../instruction/mute.js')
	}
};

Object.assign(process, process.scr.utils); // Надо заменить все обращения.
