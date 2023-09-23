const { MessageEmbed } = require('discord.js');
const { poke } = process.json.locales.commands;
const { images } = process.scr.instruction;

module.exports.help = {
	name: ['poke', 'ткнуть'],
	usage: {
		en: 'poke *<@user>',
		ru: 'ткнуть *<@пользователь>'
	},
	description: {
		en: 'Do poke in your objectionable users ',
		ru: 'Тыкай в неугодных тебе пользователей!'
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
			embed.setDescription(poke.notArgsUser[language].format(bot.user.username, message.author.username));
			break;
		case member.id === bot.user.id:
			return message.channel.send(poke.argsUserIsBot[language].random());
			break;
		default:
			embed.setDescription(poke.poke[language].random().format(message.author.username, member.user.username));
			break;
	}

	await message.channel.send(embed.setImage(await images.sfw.poke()));
};
