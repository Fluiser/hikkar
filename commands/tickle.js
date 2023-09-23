const { images } = process.scr.instruction;
const { tickle } = process.json.locales.commands;
const { MessageEmbed } = require('discord.js');

module.exports.help = {
	name: ['tickle', 'щекотать'],
	usage: {
		en: 'tickle *<@user>',
		ru: 'щекотать *<@пользователь>'
	},
	description: {
		en: 'If your friend feel self bad,try tickle him.',
		ru: 'Если ваш друг чувствует, попытайтесь его развеселить пощекотав его.'
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
			embed.setDescription(tickle.notArgsUser[language].format(message.author.username));
			break;
		case member.id === bot.user.id:
			return message.channel.send(tickle.argsUserIsBot[language].random());
			break;
		default:
			embed.setDescription(tickle.tickle[language].format(message.author.username, member.user.username));
			break;
	}

	await message.channel.send(embed.setImage(await images.sfw.tickle()));
};
