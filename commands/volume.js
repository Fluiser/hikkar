const { embeds } = process.scr;
const { locales } = process.json;

module.exports.help = {
	name: ['volume', 'громкость'],
	usage: {
		en: 'volume <volume value>',
		ru: 'громкость <значение громкости>'
	},
	description: {
		en: 'Change volume in voice play.',
		ru: 'Изменяет громкость в голосовом воспроизведении'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'music'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	const voice = message.member.voice && message.member.voice.channel;
	const voiceChannel =
		message.guild.voice && message.guild.voice.connection && message.guild.voice.connection.channel;
	const player = process.players.get(voiceChannel && voiceChannel.id);

	const volume = Math.floor(+args[0]);

	if (!voice || !voiceChannel || !player) {
		await message.channel.send(embeds.error(message, locales.system.player.notStream[language]));
		return;
	}

	if (!args.length) {
		await message.channel.send(`${Math.floor(player._volume * 100)}%`);
		return;
	}

	if (!volume || volume < 0 || volume > 200) {
		await message.channel.send(embeds.error(message, locales.system.player.invalidVolume[language]));
		return;
	}

	await player.volume(+volume);
};
