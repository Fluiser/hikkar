const { slap } = process.json.locales.commands;
const { images } = process.scr.instruction;
const { MessageEmbed } = require('discord.js');

module.exports.help = {
	name: ['slap', 'шлёп', 'шлёпнуть'],
	usage: {
		en: 'slap *<@user>',
		ru: 'шлёп *<@пользователь>'
	},
	description: {
		en: 'Do slap bad user.',
		ru: 'Ваш друг разочаровал Вас? Шлёпните его по жопке.'
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
			embed.setDescription(slap.self_slap[language].random().format(message.author.username));
			break;
		case member.id === bot.user.id:
			return message.channel.send(slap.argsUserIsBot[language].random().format(message.author.username));
			break;
		default:
			embed.setDescription(slap.slap[language].random().format(message.author.username, member.user.username));
	}

	await message.channel.send(embed.setImage(await images.sfw.slap()));
};
