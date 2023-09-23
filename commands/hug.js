const { MessageEmbed } = require('discord.js');
const { hug } = process.json.locales.commands;
const { images } = process.scr.instruction;

module.exports.help = {
	name: ['hug', 'обнять'],
	usage: {
		en: 'hug *<@user>',
		ru: 'обнять *<@пользователь>'
	},
	description: {
		en: 'If you friend feel self bad hug him.',
		ru: 'Если ваш друг чувствует себя плохо, обнимите его.'
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
			embed.setDescription(hug.notArgsUser[language].format(bot.user.username, message.author.username));
			break;
		case member.id === bot.user.id:
			return message.channel.send(hug.argsUserIsBot[language].random());
			break;
		default:
			embed.setDescription(hug.hug[language].format(message.author.username, member.user.username));
			break;
	}

	await message.channel.send(embed.setImage(await images.sfw.hug()));
};
