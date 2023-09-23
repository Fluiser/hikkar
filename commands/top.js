const { sqlCall } = process.scr.utils;
const { sql } = process.scr;
const { MessageEmbed } = require('discord.js');
const { embeds } = process.scr;

module.exports.help = {
	name: ['top', 'топ', 'score'],
	usage: {
		en: 'top <users|guilds>',
		ru: 'топ <пользователей | серверов>'
	},
	description: {
		en: 'Show top server/users.',
		ru: 'Показывает топ серверов/пользователей.'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'utils'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	if(['users', 'user', 'profiles', 'profile', 'пользователей', 'пользователь'].includes(String(args[0]).toLowerCase()))
	{
		const data = await sqlCall('SELECT * FROM profiles ORDER BY messages DESC LIMIT 10');
		let cuser = data.find(d => d.id === message.author.id);
		if(!cuser)
		{
			cuser = await sql.get('profiles', {id: message.author.id});
			cuser.db = true;
		}
		const embed = new MessageEmbed();
		let i = 1;
		for(const user of data)
		{
			const _dsuser = bot.users.cache.get(user.id);
			embed.addField(`[${i++}] ${message.author.id === user.id ? '*->' : ''} ${_dsuser && _dsuser.username || "N/A"}`, `${user.level}Lv. [${user.xp}xp]; ${user.messages} ${language === 'en' ? 'messages' : 'сообщений'}`);
		}
		if(cuser.db)
		{
			embed.addField(`*-> ${message.author.username}`, `${cuser.level}Lv. [${cuser.xp}xp]; ${cuser.messages} ${language === 'en' ? 'messages' : 'сообщений'}`);
		}
		return await message.channel.send(embed);
	}
	else
	{
		const data = await sqlCall('SELECT * FROM guilds_info ORDER BY messages DESC LIMIT 10');
		let cguild = data.find(d => d.id === message.guild.id);
		if(!cguild)
		{
			cguild = await sql.get('guilds_info', {id: message.guild.id});
			cguild.db = true;
		}
		const embed = new MessageEmbed();
		let i = 1;
		for(const guild of data)
		{
			const _dsguild = bot.guilds.cache.get(guild.id);
			embed.addField(`[${i++}] ${message.guild.id === guild.id ? '*->' : ''} ${_dsguild && _dsguild.name || "N/A"}`, `${guild.messages} ${language === 'en' ? 'messages' : 'сообщений'}; ${_dsguild && _dsguild.memberCount} ${language === 'en' ? 'members' : 'участников'}`);
		}
		if(cguild.db)
		{
			embed.addField(`*-> ${message.guild.name}`, `${cguild.messages} ${language === 'en' ? 'messages' : 'сообщений'}; ${message.guild.memberCount} ${language === 'en' ? 'members' : 'участников'}`);
		}
		return await message.channel.send(embed);
	}
};
