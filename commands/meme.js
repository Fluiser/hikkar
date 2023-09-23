const { MessageEmbed } = require('discord.js');
const superagent = require('superagent');

module.exports.help = {
	name: ['meme', 'мем'],
	usage: {
		en: 'meme',
		ru: 'мем'
	},
	description: {
		en: 'If you are depressed, it may cheer you up.',
		ru: 'Если у вас депрессия, то это вам поможет, а может и нет.'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'social'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let embed = new MessageEmbed();
	language == 'ru'
		? embed.setImage(`http://admem.ru/content/images/139112${Math.floor(Math.random() * 10000)}.jpg`)
		: embed.setImage((await superagent.get('https://meme-api.herokuapp.com/gimme')).body.url);
	embed
		.setAuthor(language == 'ru' ? 'Ну, типо смешно' : 'Well kind of funny')
		.setFooter(language == 'ru' ? 'Ну, мы пытались как могли' : 'Well we tried our best');
	await message.channel.send(embed);
};
