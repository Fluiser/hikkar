const { MessageEmbed } = require('discord.js');
const { penis } = process.json.locales.commands;
const data = new Map();

module.exports.help = {
	name: ['penis', 'писюн', 'член', 'битва_на_членах', 'хер'],
	description: {
		en: 'If the user claims that his member is larger, you can check yours.',
		ru: 'Если ваш друг угрожает вам, можете припугнуть его своим членом.'
	},
	usage: {
		en: 'penis',
		ru: 'хер'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'fun'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let embed = new MessageEmbed();
	let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
	let argsUser = (member && member.user) || message.author;

	switch (true) {
		case member && member.id === bot.user.id:
			return message.channel.send(penis.argsUserIsBot[language]);
		case member && member.id !== message.author.id:
			embed.setDescription(penis.memberDefined[language]);
			break;
		default:
			let size = data.get(argsUser.id);
			if (!size) {
				size = Math.floor(Math.random() * 20);
				data.set(argsUser.id, size);
			}
			embed
				.setDescription(penis.penis[language].format('='.repeat(size), size))
				.setAuthor(message.author.username, message.author.avatarURL({}));
			break;
	}
	await message.channel.send(embed);
};
