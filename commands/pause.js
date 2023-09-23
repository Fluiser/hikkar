const { players } = process;
const { play } = process.json.locales.commands;
const { player } = process.json.locales.system;
const { embeds } = process.scr;

module.exports.help = {
	name: ['pause', 'пауза'],
	description: {
		en: 'If you need to move away you can set pause.',
		ru: 'Если тебе нужно отойти, можешь поставить паузу.'
	},
	usage: {
		en: 'pause',
		ru: 'pause'
	},
	permissions: ['SEND_MESSAGES', 'MANAGE_CHANNELS'],
	bot_permissions: ['SEND_MESSAGES', 'SPEAK'],
	owner: false,
	tag: 'music'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let channel = message.member.voice.channel;
	if (!channel) {
		await message.channel.send(embeds.error(message, play.notVoice[language]));
		return;
	}
	if (!(channel = players.get(channel.id))) {
		await message.channel.send(embeds.error(message, player.notStream[language]));
		return;
	}
	await message.channel.send(
		language === 'en'
			? (await channel.pause())
				? 'Pause.'
				: 'Resume'
			: (await channel.pause())
			? 'Пауза'
			: 'Воспроизведение'
	);
};
