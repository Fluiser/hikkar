const { sqlCall } = process.scr.utils;
const { sqlPatterns, embeds } = process.scr;
const { MessageEmbed } = require('discord.js');

module.exports.help = {
	name: ['casino', 'казино'],
	usage: {
		en: 'casino <rate>',
		ru: 'казино <ставка>'
	},
	description: {
		en: "It's casino, dude. What do you want this see?\nYou do bet, then, you win or lose.",
		ru: 'Просто казино, чувак. (Я рад, что ты читаешь это сообщение. (с) разрабы <3)\nТы делаешь ставку, и, в результате проигрываешь или выигрываешь ставку.'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'economy'
};

const variables = [
	{
		text: '💰',
		value: 0.8
	},
	{
		text: '❤',
		value: 0.5
	},
	{
		text: '🖤', // black heart
		value: -0.2
	},
	{
		text: '🍪', // please, donate developer's for cookies.
		value: 0.4
	},
	{
		text: '💠', // I don't know what it, but it looking expensive.
		value: 0.6
	},
	{
		text: '⚜',
		value: -0.2
	},
	{
		text: '🔱',
		value: -0.2
	},
	{
		text: '🔰',
		value: 0.4
	}
];

module.exports.run = async (bot, message, args, language = 'en') => {
	let [profile] = await sqlCall(
		`SELECT * FROM profiles WHERE id = '${message.author.id}'`,
		sqlPatterns.profile,
		message.author
	);
	let [rate] = args;
	let experience = 0;
	const text = [];

	if (String(rate).toLowerCase() !== 'all') {
		if (!rate || Number.isNaN(+rate) || (rate = +rate) < 1) {
			await message.channel.send(
				embeds.invalidArgs(
					message,
					language === 'en'
						? 'You defined incorrect  argument.\nRate type must be number, or larger than 0'
						: 'Ты указан некорректный аргумент.\n Ставка должна быть числом, или быть больше нуля.'
				)
			);
			return;
		}
	} else if (profile.money <= 0) {
		await message.channel.send(
			embeds.error(
				message,
				language === 'en' ? "You don't have crystals  OwO" : 'Котик, у тебя нет кристаллов. OwO'
			)
		);
		return;
	} else rate = profile.money;

	if (rate > profile.money) {
		await message.channel.send(
			embeds.error(
				message,
				language === 'en' ? "You don't have that much crystals" : 'Котик, у тебя нет столько кристаллов. :c'
			)
		); 
		return;
	}

	profile.money -= rate;

	for (let i = 0; i < 3; ++i) {
		let v = variables.random();
		text.push(v.text);
		experience += v.value;
	}
	if(text[0] === text[1] && text[1] === text[2])
		experience = 3;
	if (experience > 0) profile.money += Math.floor(experience * rate);
	await sqlCall(`UPDATE profiles SET money = ${profile.money} WHERE id = '${message.author.id}'`);
	await message.channel.send(embeds.casino(message, text.join(""), experience, rate, profile.money, language));
};
