const { embeds, sqlPatterns } = process.scr;
const { osu } = process;
const { sql } = process.scr;
const { MessageEmbed } = require('discord.js');
const { locales } = process.json;

module.exports.help = {
	name: ['osu', 'осу'],
	usage: {
		en: 'osu *<instruction> ?<...args>',
		ru: 'осу *<инструкция> ?<...аргументы>'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'game'
};

module.exports.functions = {
	setnick: async (message, args, member, language) => {
		args = args.join(' ');
		let user = await osu.getUser(args);
		if (!user) return embeds.error(message, locales.commands.osu.notFoundUser[language].format(args));
		else {
			if ((await sql.getAll('osu', { id: message.author.id })).length) {
				await sql.update('osu', { username: args }, { id: message.author.id });
			} else await sqlPatterns.osu({ id: message.author, username: args });
			return new MessageEmbed().setDescription(
				language === 'en' ? 'Username has been changed!' : 'Имя пользователя было изменено'
			);
		}
	},
	get: async (message, args, member, language) => {
		let user, username, mode;
		if (!member) member = message.member;
		if(args.length > 0) {
			if(args.length > 1) mode = osu.getMode(args.pop());
			username = args.join(' ');
			user = await osu.getUser(username, mode);
		} else {
			user = await sql.get('osu', { id: member.id });
			if (user) user = await osu.getUser(user.username, user.mode);
		}
		if (!user)
			return embeds.error(
				message,
				username
					? locales.commands.osu.notFoundUser[language].format(username)
					: locales.commands.osu.userIsNotDefined[language]
			);
		return embeds.osu(user, language);
	},
	setmode: async (message, args, member, language) => {
		if (!(await sql.get('osu', { id: message.author.id })))
			return embeds.error(message, locales.commands.osu.userIsNotDefined[language]);
		let mode = await args.join(' ').toLowerCase();
		await sql.update('osu', { mode: osu.getMode(mode) });
		return new MessageEmbed().setDescription(locales.commands.osu.changeMode[language].format(mode));
	}
};

module.exports.help.description = {
	en: `Available instructions: ${Object.keys(module.exports.functions)
		.map(s => `\`${s}\``)
		.join(', ')}`,
	ru: `Доступные инструкции: ${Object.keys(module.exports.functions)
		.map(s => `\`${s}\``)
		.join(', ')}`
};

module.exports.run = async (bot, message, args, language = 'en') => {
	const member = message.guild.member(args[0]) || message.mentions.members.first() || message.member;
	if (member && member.user.bot) return;
	await message.channel.send(
		await ((args[0] && module.exports.functions[args[0].toLowerCase()]) || module.exports.functions.get)(
			message,
			args.slice(1),
			member,
			language
		)
	);
};
