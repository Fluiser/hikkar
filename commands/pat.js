const { pat } = process.json.locales.commands;
const { images } = process.scr.instruction;
const { MessageEmbed } = require('discord.js');

module.exports.help = {
	name: ['pat', 'погладить', 'гладить'],
	usage: {
		en: 'pat *<@user>',
		ru: 'погладить *<@пользователь>'
	},
	description: {
		en: 'Do pat her if your girlfriend is cute.',
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
			embed.setDescription(pat.notArgsUser[language].format(bot.user.username, message.author.username));
			break;
		case member.id === bot.user.id:
			return message.channel.send(pat.argsUserIsBot[language].random());
			break;
		default:
			embed.setDescription(pat.pat[language].format(message.author.username, member.user.username));
			break;
	}

	await message.channel.send(embed.setImage(await images.sfw.pat()));
};
