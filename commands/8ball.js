const { ball } = process.json.locales.commands;
const { MessageEmbed } = require('discord.js');
const { embeds } = process.scr;

module.exports.help = {
	name: ['8ball', 'шар', 'предсказание'],
	usage: {
		en: '8ball *<question>',
		ru: 'шар *<вопрос>'
	},
	description: {
		en: 'Thinking about some question? Ask the ball!',
		ru: 'Задумались над каким-то вопросом? Спросите у шара!'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'utils'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	if (!args.length) return message.channel.send(language === 'en' ? 'You love froges?' : 'Ты любишь лягушек?');
	await message.channel.send(
		new MessageEmbed()
			.setDescription(args.join(' '))
			.setAuthor(
				`${language === 'en' ? 'Magic ball tells' : 'Магический шар говорит'}: ${ball[language].random()}`
			)
	);
};
