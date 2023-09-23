const { MessageEmbed } = require('discord.js');
let { sqlPatterns, utils } = process.scr;
let { sqlCall } = process.scr.utils;
const avatarOBJ = {
	format: 'png',
	size: 4096
};

module.exports.help = {
	name: ['serverinfo', 'sinfo', 's-info', 'server', 'серверинфо', 'синфо', 'сервер'],
	usage: {
		en: 'serverinfo',
		ru: 'сервер'
	},
	regions: {
		deprecated: 'Discord больше такое не поддерживает.',
		russia: 'Россия',
		brazil: 'Бразилия',
		'eu-central': 'Центральная Европа',
		hongkong: 'Хот-конг',
		india: 'Индия',
		japan: 'Япония',
		singapore: 'Сингапур',
		southafrica: 'Африка',
		sydney: 'Сидней',
		'us-central': 'США - центр',
		'us-east': 'США - восток',
		'us-south': 'США - юг',
		'us-west': 'США - запад',
		'eu-west': 'Западная Европа'
	},
	description: {
		en: 'Show main information about guild.',
		ru: 'Показывает основную информацию о сервере.'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'standart'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let [guild] = await sqlCall(
		`SELECT * FROM guilds_info WHERE id = '${message.guild.id}'`,
		sqlPatterns.guild,
		message.guild
	);
	let members = message.guild.members.cache;
	if (!message.guild.members.cache) await message.guild.member.fetch();
	let statuses = {
			online: await bot.emojis.resolve('516884210305466379'),
			idle: await bot.emojis.resolve('516884210208866314'),
			dnd: await bot.emojis.resolve('516884210057871361'),
			offline: await bot.emojis.resolve('516884210225512468')
		},
		ruStatus = {
			online: 'В сети',
			idle: 'Не активен',
			dnd: 'Не беспокоить',
			offline: 'Не в сети'
		},
		ruTypesChannels = {
			category: 'категорий',
			text: 'текстовых',
			voice: 'голосовых'
		};

	let embed = new MessageEmbed()
		.setAuthor(message.guild.name, message.guild.iconURL(avatarOBJ))
		.addField(
			language === 'en' ? 'Region' : 'Регион',
			language === 'en'
				? message.guild.region
				: module.exports.help.regions[String(message.guild.region).toLowerCase()] ||
						'Пни кодера, тут нету перевода.'
		)
		.addField(
			`${language === 'en' ? 'Members' : 'Участники'}[${message.guild.members.cache.size}]`,
			`${language === 'en' ? 'Online' : 'В сети'}: ${
				members.filter(member => member.presence.status !== 'offline').size
			}
	${(() => {
		let index = '';
		for (let field of Object.keys(statuses)) {
			index += `${statuses[field]}**${language === 'en' ? field : ruStatus[field]}**: ${
				members.filter(member => member.presence.status === field).size
			}\n`;
		}
		return index;
	})()}\n📨${language === 'en' ? 'Messages' : 'Сообщений'}: ${guild.messages}`,
			true
		);
	embed.addField(
		language === 'en' ? 'Date creation' : 'Дата создания',
		`${utils.timeFormat(message.guild.createdAt, language)}\n(${utils.durationFormat(
			Date.now() - message.guild.createdAt,
			language
		)})`,
		true
	);
	embed.addField(
		language === 'en' ? 'Channels' : 'Каналы',
		(() => {
			let index = '';
			for (let type of Object.keys(ruTypesChannels)) {
				index += `${language === 'en' ? type : ruTypesChannels[type]}: ${
					message.guild.channels.cache.filter(c => c.type === type).size
				}\n`;
			}
			return index;
		})() +
			`\nAFK ${language === 'en' ? 'channel' : 'канал'}: ${
				message.guild.afkChannel ? message.guild.afkChannel : 'null'
			}`,
		true
	);
	embed.addField(
		`${language === 'en' ? 'Emojis' : 'Эможи'}[${message.guild.emojis.cache.size}]`,
		`\`${guild.prefix}\`${language === 'en' ? 'info emojis' : 'инфо эможи'}`
	);
	await message.channel.send(embed);
};
