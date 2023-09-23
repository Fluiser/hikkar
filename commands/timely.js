const { sqlCall, durationFormat } = process.scr.utils;
const { MessageEmbed } = require('discord.js');

module.exports.help = {
	name: ['freemoney', 'денегдай', 'ежедневка', 'daily', 'timely'],
	usage: {
		en: 'daily',
		ru: 'денегдай'
	},
	description: {
		en: 'Give 500 crystalls. Interval - 12 hours.',
		ru: 'Даёт 500 кристаллов. Интервал - 12 часов.'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'economy'
};

const data = new Map();

module.exports.run = async (bot, message, args, language) => {
	if(data.has(message.author.id) && data.get(message.author.id)+1000*60*60*12 >= Date.now()) return await message.channel.send(`${language === 'en' ? 'You must wait' : 'Ты должен подождать'} ${durationFormat( data.get(message.author.id)+1000*60*60*12 - Date.now(), language)}`)
	await sqlCall(`UPDATE profiles SET money=money+500 WHERE id = ${message.author.id}`);
	data.set(message.author.id, Date.now());
	await message.channel.send(
		new MessageEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL({}))
			.setDescription(`+500 ${process.moneyEmoji}`)
	);
};
