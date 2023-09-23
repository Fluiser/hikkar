const { MessageEmbed } = require('discord.js');
const { images } = process.scr.instruction;
const { kiss } = process.json.locales.commands;

module.exports.help = {
	name: ['kiss', 'поцеловать', 'поцелуй'],
	usage: {
		en: 'kiss *<@user>',
		ru: 'поцелуй *<@пользователь>'
	},
	description: {
		en: 'If girlfriend erotically  look on you, you can kiss her.',
		ru: 'Если девушка на вас эротишно смотрит, можете её поцеловать.'
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
			embed.setDescription(kiss.notArgsUser[language].format(bot.user.username, message.author.username));
			break;
		case member.id === bot.user.id:
			return message.channel.send(kiss.argsUserIsBot[language].random());
			break;
		default:
			embed.setDescription(kiss.kiss[language].format(message.author.username, member.user.username));
			break;
	}

	await message.channel.send(
		embed.setImage(await (!member || member.id === bot.user.id ? images.sfw.pat() : images.sfw.kiss()))
	);
};
