const { sql } = process.scr;
const { MessageEmbed } = require('discord.js');

module.exports.help = {
	name: ['money', 'balance', '$', 'баланс', 'деньги'],
	usage: {
		en: '$ *<@user>',
		ru: '$ *<@юзер>'
	},
	description: {
		en: 'Show length crystals',
		ru: 'Показывает количество кристаллов'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'economy'
};

module.exports.run = async (bot, message, args, l) => {
	let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
	let profile = await sql.get('profiles', {id: member.user.id}, member.user) || {money: 0};
	await message.channel.send(
		new MessageEmbed()
			.setAuthor(member.user.tag, member.user.avatarURL({}))
			.setDescription(`${profile.money} ${process.moneyEmoji}`)
	);
};
