const { system } = process.json.locales;
const { error } = process.scr.embeds;

module.exports.help = {
	name: ['skip', 'пропуск', 'пропустить'],
	usage: {
		en: 'skip',
		ru: 'пропуск'
	},
	description: {
		en: 'Skip something song',
		ru: 'Изменяет указанные параметры.'
	},
	permissions: ['CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
	bot_permissions: ['CONNECT', 'SPEAK', 'VIEW_CHANNEL', 'MANAGE_CHANNELS'],
	owner: false,
	tag: 'music'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	const voice = message.member.voice.channel;
	const voiceChannel = message.guild.voice.connection && message.guild.voice.connection.channel;
	const player = process.players.get(voiceChannel && voiceChannel.id);

	if (!voice || !voiceChannel || !player)
		await message.channel.send(error(message, system.player.notStream[language]));
	else await message.channel.send(await player.skip(message.author));
};
