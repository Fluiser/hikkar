const { MessageEmbed } = require('discord.js');

module.exports.help = {
	name: ['invite', 'binvite', 'botinvite', 'бот', 'приглашение', 'пригласить'],
	usage: {
		en: 'binvite',
		ru: 'бот'
	},
	description: {
		en: 'Just link for invite bot.',
		ru: 'Просто ссылка приглашения бота.'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES'],
	owner: false,
	tag: 'utils'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	const link = `https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=8`;
	await message.channel.send(
		link,
		new MessageEmbed().setDescription(`[${language === 'en' ? 'link' : 'ссылка'}](${link})`)
	);
};
