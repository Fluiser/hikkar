const { sql } = process.scr;
const { sqlCall } = process.scr.utils;
const { embeds } = process.scr;
const { locales } = process.json;

module.exports.help = {
	name: ['transfer', 'передать', 'pay', 'отдать', 'перевести'],
	usage: {
		en: 'transfer <@user> <quantity>',
		ru: 'передать <@юзер> <количество>'
	},
	description: {
		en: 'Transfer crystals to a user ',
		ru: 'Передать кристаллы пользователю'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'economy'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

	if (!user) {
		await message.channel.send(embeds.error(message, locales.templates.noUser[language]));
		return;
	}

	const quant = +args[1];

	if (Number.isNaN(quant) || quant < 50) {
		await message.channel.send(
			embeds.error(message, locales.templates.incorrectArgs[language].format('pay <@user> <n >= 50>'))
		);
		return;
	}

	const user_data = await sql.get('profiles', { id: message.author.id }, user.user);

	if (user_data.money < quant) {
		await message.channel.send(embeds.error(message, locales.commands.transfer.noCrystals[language].format(quant)));
		return;
	}

	user_data.money -= quant;
	await sql.update({ money: user_data + Math.floor(quant * 0.95) }, { id: message.author.id });
	await message.channel.send(embeds.transfer(message, quant, user, language));
};
