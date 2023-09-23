const { smug } = process.json.locales.commands;
const { images } = process.scr.instruction;
const { MessageEmbed } = require('discord.js');

module.exports.help = {
	name: ['smug', 'улыбка'],
	usage: {
		en: 'smug *<@user>',
		ru: 'улыбка *<@пользователь>'
	},
	description: {
		en: 'If your enemy is looking at you, smile maliciously at him.',
		ru: 'Если ваш враг смотрит на вас, ехидно улыбнитесь ему.'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'social'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
	let embed = new MessageEmbed();

	switch (true) {
		case !member || member.id === message.author.id:
			embed.setDescription(smug.notArgsUser[language].format(message.author.username));
			break;
		case member.id === bot.user.id:
			return message.channel.send(smug.argsUserIsBot[language].random());
			break;
		default:
			embed.setDescription(smug.smug[language].format(message.author.username, member.user.username));
			break;
	}

	await message.channel.send(embed.setImage(await images.sfw.smug()));
};
