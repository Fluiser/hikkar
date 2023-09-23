const { MessageEmbed } = require('discord.js');
const { ruPermissions } = process.scr;

module.exports.help = {
	name: ['help', 'помощь', 'помогите', 'commands'],
	usage: {
		en: 'help *<tag or command>',
		ru: 'помощь *<тэг или команда>'
	},
	description: {
		en: 'Show description and another information about defined argument.',
		ru: 'Показывает основную информацию о указанном аргументе.'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'utils'
};

module.exports.run = async (bot, message, args, language = 'en', _guild) => {
	//TODO: Переделать всё.
	//Нахуй надо.
	const embed = new MessageEmbed();
	const { collectionCmds } = process;
	
	if (args[0] && (cmd = collectionCmds.get(args[0] = args[0].toLowerCase())))
		embed.setDescription(
			`⚙️${language === 'en' ? 'Names' : 'Имена'}: ${cmd.help.name.map(e => `\`${e}\``).join(', ')}\n❓${
				language === 'en' ? 'Need permissions' : 'Нужные права'
			}: ${
				language === 'en'
					? cmd.help.permissions.map(perm => `**${perm.toLowerCase().replace(/\_/gi, ' ')}**`).join(', ')
					: cmd.help.permissions.map(perm => `**${ruPermissions[perm]}**`).join(',')
			}\n➡️${language === 'en' ? 'Usage' : 'Использование'}:\`${cmd.help.usage[language]}\`\n🗒️${
				cmd.help.description[language]
			}\n\n${cmd.help.owner ? '$sudo' : ''}`
		);
	else {
		const collect = {};
		let cmd;

		for (const command of collectionCmds.values()) {
			if(command.help.owner) continue;
			if(!collect[command.help.tag]) collect[command.help.tag] = [];
			const tag = collect[command.help.tag];
			if(tag[tag.length-1] !== command.help)
				tag.push(command.help);
		}
		if (args[0] && (cmd = collect[args[0]])) {
			if (cmd.length > 24) embed.setDescription(cmd.map(c => `\`${c.name[0]}\``).join(','));
			else {
				for (let command of cmd) {
					embed.addField(command.name.join(', '), command.description[language]);
				}
			}
		} else {
			for (let tag of Object.keys(collect)) {
				embed.addField(tag, collect[tag].map(cmd => `\`${cmd.name[0]}\``).join(', '));
			}
		}
	}	
	if(_guild)
		embed.setFooter(`${_guild.prefix}help <?>`);
	await message.channel.send(embed);
};
