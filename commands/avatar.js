const { MessageEmbed } = require('discord.js');

module.exports.help = {
	name: ['avatar', 'аватар', 'ava', 'ава'],
	usage: {
		en: 'avatar *<user>',
		ru: 'аватар *<юзер>'
	},
	description: {
		en: 'Shows user avatar.',
		ru: 'Показывает аватар указанного юзера'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'utils'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let member = message.guild.member(args[0]) || message.mentions.members.first() || message.member;
	let embed = new MessageEmbed()
		.setAuthor(member.user.tag)
		.setImage(member.user.displayAvatarURL({ dynamic: true, size: 4096 }));
	await message.channel.send(embed);
};
