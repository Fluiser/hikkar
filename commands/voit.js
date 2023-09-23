const { embeds } = process.scr;
const { MessageEmbed } = require('discord.js');
const { locales } = process.json;

module.exports.help = {
	name: ['voit', 'voting', 'vote', 'голосование'],
	usage: {
		en: 'voit question;answer;answer2',
		ru: 'голосование вопрос;ответ;ответ2'
	},
	description: {
		en: 'Make voting dashboard',
		ru: 'Создаёт голосование.'
	},
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'utils'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let answer = args
		.join(' ')
		.split(';')
		.filter(v => v.match(/[^\s]/));
	let question = answer.shift();
	let s = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣'];
	if (answer.length < 2 || answer.length > 9)
		return message.channel.send(embeds.invalidArgs(message, locales.commands.voit.noArgs[language]));

	let embed = new MessageEmbed().setDescription(question);
	for (let i = 0; i < answer.length; ++i) {
		embed.addField(`[${s[i]}] ${language === 'en' ? 'Variable' : 'Вариант'}:`, answer[i]);
	}
	let msg = await message.channel.send(embed);
	for (let i = 0; i < answer.length; ++i) await msg.react(s[i]);
};
