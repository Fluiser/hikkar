const { MessageEmbed } = require('discord.js');
const { sort } = process.scr.utils;
const avatarOBJ = {
	format: 'png',
	size: 4096
};

module.exports.help = {
	name: ['info', 'инфо', 'information', 'информация'],
	usage: {
		en: 'info <element> *?<...args>',
		ru: 'инфо <элемент> *?<...аргументы>'
	},
	description: {},
	elements: {
		ru: ['эможи', 'роли'],
		en: ['emoji', 'roles']
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'utils'
};

module.exports.help.description.ru = `Показывает информацию из указанного элемента.\nДоступные элементы: [${module.exports.help.elements.ru
	.map(e => `\`${e}\``)
	.join(', ')}]`;
module.exports.help.description.en = `Show information about defined element.\nAvailable elements: [${module.exports.help.elements.en
	.map(e => `\`${e}\``)
	.join(', ')}]`;

module.exports.run = async (bot, message, args, language = 'en') => {
	let embed = new MessageEmbed().setAuthor(message.guild.name, message.guild.iconURL(avatarOBJ));
	let temp;

	switch (String(args[0]).toLowerCase()) {
		case 'emoji':
		case 'emojis':
		case 'эможи':
		case 'эмоджи':
			temp = message.guild.emojis.cache.map(e => e.toString()).join('');
			if (temp.length > 2048) temp = temp.slice(0, 2045) + '...';
			embed.setDescription(temp);
			break;
		case 'roles':
		case 'role':
		case 'роли':
		case 'роль':
			temp = message.guild.roles.cache
				.filter(r => r.id !== message.guild.id)
				.sort(sort.role)
				.map(r => `[${r.position}] ${r} - ${r.id}`)
				.join('\n')
				.list(2048, '\n');
			embed
				.setDescription(temp[+args[1] - 1] || temp[0])
				.setFooter(`${temp[+args[1] - 1] ? args[1] : 1}/${temp.length}`);
			break;
		default:
			embed.setDescription(
				`${module.exports.help.elements[language].join('/')}\n${
					language === 'en' ? 'You are not defined value.' : 'Ты не указал необходимое тебе значение.'
				}`
			);
			break;
	}

	await message.channel.send(embed);
};
