const { randomRGB } = process.scr.utils;
const { embeds } = process.scr;
const { MessageEmbed } = require('discord.js');

module.exports.embedParse = str => {
	let index;

	try {
		index = new MessageEmbed(JSON.parse(str));
	} catch {
		index = new MessageEmbed().setDescription(str);
	}

	return index;
};

module.exports.help = {
	name: ['say', 'сказать'],
	usage: {
		en: 'say *<?type> <content>',
		ru: 'сказать *<?тип> <содержание>'
	},
	description: {
		en: 'Send message of author bot. types: [tts, embed, default(text)]',
		ru: 'Отправлять сообщение от бота. типы: [tts, эмбед, по умолчанию(текст)]'
	},
	permissions: ['MANAGE_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'chat'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	try {await message.delete(); } catch { /*what the fuck?*/ }

	if (!args.length) {
		return;
	}

	args = args
		.join(' ')
		.replace(/hex.random\(\)/g, randomRGB())
		.split(' ');

	if (process.convertSayTextToSayEmoji)
		args = args
			.split(':')
			.map((e, i) => (i % 2 ? e : bot.emojis.cache.find(emj => emj.name.toLowerCase() === e.toLowerCase()) || e));

	switch (String(args[0]).toLowerCase()) {
		case 'tts':
			await message.channel.send(args.slice(1).join(' '), { tts: true });
			break;
		case 'embed':
			await message.channel.send(module.exports.embedParse(args.slice(1).join(' ')));
			break;
		default:
			await message.channel.send(args.join(' '));
			break;
	}
};
