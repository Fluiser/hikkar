const { embeds } = process.scr;
const { locales } = process.json;
const { players } = process;

module.exports.help = {
	name: ['repeat', 'повторять', 'loop', 'зациклить'],
	usage: {
		en: 'repeat <repeats=Infinity>',
		ru: 'зациклить <повторения=Бесконечно>'
	},
	description: {
		en: 'Plays the last track endlessly. Until you turn it off.',
		ru: 'Бесконечно воспроизводит последний трэк. Пока вы это не отключите.'
	},
	permissions: ['CONNECT', 'SPEAK'],
	bot_permissions: ['CONNECT', 'SPEAK', 'VIEW_CHANNEL', 'MANAGE_CHANNELS'],
	owner: false,
	tag: 'music'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let channel = message.member.voice.channel;
	let player;

	if (!channel) {
		await message.channel.send(embeds.error(message, play.notVoice[language]));
		return;
	}
	if (!(player = players.get(channel.id))) {
		await message.channel.send(embeds.error(message, locales.system.player.notStream[language]));
		return;
	}
	if (!channel.permissionsFor(message.author.id).has('MANAGE_CHANNELS')) {
		await message.channel.send(embeds.embeds.notPermissions(message.author, ['MANAGE_CHANNELS']));
		return;
	}
	if (player.queue.length < 1) return;
	const length = args[0] > 0 && args[0] < 4294967295 && +args[0];
	if (!length) {
		player.repeat = player.repeat === Infinity ? 0 : Infinity;
	} else {
		player.repeat = length;
	}
	await message.channel.send(
		`${language === 'en' ? 'Repeats' : 'Повторений'}: **${
			player.repeat === Infinity ? (language === 'en' ? 'Infinity' : 'Бесконечно') : player.repeat
		}**`
	);
};
