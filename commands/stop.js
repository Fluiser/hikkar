const { play } = process.json.locales.commands;
const { player } = process.scr.locales.system;
const { players } = process;
const { embeds } = process.scr;

module.exports.help = {
	name: ['stop', 'стоп'],
	description: {
		en: 'If you want to stop playing music and clean queue.',
		ru: 'Если ты хочешь прекратить проигрывание и очистить очередь.'
	},
	usage: {
		en: 'stop',
		ru: 'стоп'
	},
	permissions: ['SEND_MESSAGES', 'MANAGE_CHANNELS'],
	bot_permissions: ['SEND_MESSAGES', 'SPEAK'],
	owner: false,
	tag: 'music'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let channel = message.member.voice.channel;
	if (!channel) return message.channel.send(embeds.error(message, play.notVoice[language]));
	if (!(channel = players.get(channel.id))) {
		await message.channel.send(embeds.error(message, play.notVoice[language]));
		return;
	}
	channel.stop();
};
