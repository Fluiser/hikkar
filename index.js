const Discord = require('discord.js');
const cfg = require('./json/bot_config.json');
const Manager = new Discord.ShardingManager('main.js', { totalShards: 1, execArgv: ['--expose-gc'] });
const superagent = require('superagent');

if (process.argv.includes('--delay-restart'))
	Manager.on('shardCreate', shard => {
		setInterval(shard.respawn, 1000 * 60 * 60 * 24 * 3 /*3days*/, 5000);
	});

setInterval(async () => {
	const v = (await Manager.fetchClientValues('guilds.cache.size')).reduce((a,b) => a+b);
	Manager.broadcastEval(`this.user.setPresence({activity: {name: 'C.g.:${v} | @' + this.user.username+ ' help'}, status: 'dnd'})`, Manager.shards.randomKey());
}, 60000);


Manager.spawn(1);
