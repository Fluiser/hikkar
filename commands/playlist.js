const { embeds } = process.scr;
const { locales } = process.json;
const { playlist } = process.scr.instruction;
const { MessageEmbed } = require('discord.js');

module.exports.help = {
	name: ['playlist', 'pl', 'плейлист', 'пл', 'pp'],
	usage: {
		en: 'playlist *<instruction> ?<...args>',
		ru: 'плейлист *<инструкция> ?<...аргументы>'
	},
	permissions: [],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'music'
};

module.exports.instruction = {
	make: async (message, args, language) => {
		if (!args.length) return embeds.error(message, locales.templates.noArgs[language].format('pp'));
		return playlist.make(message.author, args.join(' '), language);
	},
	find: async (message, args, language) => {
		if (!args.length) return 'Hello world!\nWhy you doing, dude?';
		let data = [];
		const user = message.mentions.users.first() || message.author;
		if (!args.length || user.id !== message.author.id) {
			data = await playlist.__raw_get({
				author: user.id
			});
		} else {
			data = await playlist.find(args.join(' '));
		}
		return new MessageEmbed().setDescription(
			data
				.map(p => {
					const author = process.bot.users.cache && process.bot.users.cache.get(p.author);
					const time = p.songs
						.filter(song => typeof song.duration === 'number')
						.reduce((a, b) => a.duration + b.duration);
					return `[${p.id}]: **${p.name}**\n${user ? `(c) ${author.tag}` : ''}`;
				})
				.join('\n')
		);
	},
	get: async (message, args, language) => {
		if (!args.length) return embeds.error(message, locales.templates.notArgs[language].format('pp'));
		if (Number.isNaN(+args[0]))
			return embeds.error(
				message,
				locales.templates.incorrectArgs[language].format(
					`pp get 1 (${
						language === 'en' ? 'Argument type must be number' : 'Тип аргумента должен быть числом'
					})`
				)
			);
		const p = await playlist.__get(+args[0]);
		if (!p)
			return embeds.error(
				message,
				language === 'en' ? "I not can't find this playlist." : 'Я не могу найти этот плейлист.'
			);
		else {
			const author = process.bot.users.cache && process.bot.users.cache.get(p.author);
			return `[${p.id}]: **${p.name}**\n${author ? `(c) ${author.tag}` : ''}`;
		}
	},
	replace: async (message, args, lenguage) => {
		if (!args.length)
			return embeds.error(
				message,
				locales.templates.notArgs[language].format(message.__variables.guild.prefix, 'pp')
			);
		if (Number.isNaN(+args[0]))
			return embeds.error(
				message,
				locales.templates.incorrectArgs[language].format(
					`pp get 1 (${
						language === 'en' ? 'Argument type must be number' : 'Тип аргумента должен быть числом'
					})`
				)
			);
		if (!args.length)
			return embeds.error(
				message,
				locales.templates.notArgs[language].format(
					message.__variables.guild.prefix,
					'pp replace <playlistId> <position> <newUrl or null>'
				)
			);
		return new MessageEmbed().setDescription(
			playlist.replace(message.author.id, args[0], args[1], language, args.slice(2).join(' '))
		);
	}
};

module.exports.help.description = {
	en: `Available instructions: ${Object.keys(module.exports.instruction)
		.map(k => `\`${k}\``)
		.join(', ')}`,
	ru: `Доступные инструкции: ${Object.keys(module.exports.instruction)
		.map(k => `\`${k}\``)
		.join(', ')}`
};

module.exports.run = async (bot, message, args, language = 'en') => {
	if (!args.length) {
		await message.channel.send(embeds.error(message, module.exports.help.description[language]));
		return;
	}
	const ins = module.exports.instruction[args.shift().toLowerCase()];
	if (!ins) {
		await message.channel.send(embeds.error(message, locales.commands.playlist.notFoundInstruction[language]));
		return;
	}
	await message.channel.send(await ins(message, args.slice(1), language));
};
