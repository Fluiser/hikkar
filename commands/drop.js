module.exports.help = {
	name: ['drop'],
	usage: {},
	description: {},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: true,
	tag: 'sudo'
};

module.exports.run = async bot => {
	if (bot.shard) bot.shard.broadcastEval('process.exit(0)');
	else process.exit(0);
};
