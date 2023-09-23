const { sqlCall, parseType, findChannel } = process.scr.utils;
const { MessageEmbed } = require('discord.js');
const { sqlPatterns } = process.scr;
const { sql } = process.scr;
const { locales } = process.json;
const {
	MessageMentions: { CHANNELS_PATTERN: _chR }
} = require('discord.js');

module.exports.help = {
	name: ['set', 'настройки', 'options', 'cfg', 'config'],
	usage: {
		en: 'set <category> *?<...args>',
		ru: 'настройки <категория> *?<...аргументы>'
	},
	description: {
		en: 'Change defined options.',
		ru: 'Изменяет указанные параметры.'
	},
	permissions: ['ADMINISTRATOR'],
	bot_permissions: ['ADMINISTRATOR'],
	owner: false,
	tag: 'admin'
};

module.exports.childVriables = {
	async logChannel(db_guild, guild, value, language) {
		if (!value.length) {
			await sql.update('guild_options', { logChannel: '' }, { id: guild.id });
			return 'null';
		}
		const channel = findChannel(guild.channels.cache, value.join(' '));
		if (!channel || channel.type !== 'text')
			return {
				error: language === 'en' ? 'This channel is not text channel `' : 'Данный канал не является текстовым `'
			};
		await sql.update('guild_options', { logChannel: channel.id }, { id: guild.id });
		return channel.toString();
	},
	async image_jl(db_guild, guild, value, lang) {
		const type = value[0];
		value = value.slice(1);

		if(!['join', 'leave'].includes(type)) {
			return {error: '`set join-leave.image <join | leave> <URL>`'};
		}

		const _sup = async (...args) => {
			if(!(await sql.get('join_leave', {id: guild.id}))){
				await sqlPatterns.join_leave(guild.id, ...args);
				return false;
			} else return true;
		}

		if(!value.length) {
			const v = {};
			v[(type === 'join' ? 'jimg' : 'limg')] = '';
			await sql.update('join_leave', v, {id: guild.id});
			return 'null';
		}

		try {
			if(!['http', 'https'].includes(new URL(value[0]).protocol)) throw 0;
		} catch {
			return {error: lang === 'en' ? 'Protocol must be http or https.' : 'Протокол должен быть http или https.'};
		}

		if(value[0].length > 64) {
			return {error: lang === 'en' ? 'Url to image must be has smaller 64 symbols.' : 'Ссылка на изображение должна быть меньше 64и символов.'};
		}

		if(await _sup(...(['', '', type === 'join' ? value[0] : '', type === 'join' ? '' : value[0]])))
		{
			await sql.update('join_leave', type === 'join' ? {jimg: value[0]} : {limg: value[0]});
		}

		return value[0];
	},
	async text_jl(_, guild, value, lang) {
		const type = value[0];
		value = value.slice(1);

		if(!['join', 'leave'].includes(type)) {
			return {error: '`set join-leave.text <join | leave> <...>`'};
		}

		const _sup = async (...args) => {
			if(!(await sql.get('join_leave', {id: guild.id}))){
				await sqlPatterns.join_leave(guild.id, ...args);
				return false;
			} else return true;
		}

		if(!value.length) {
			const v = {};
			v[(type === 'join' ? 'jimg' : 'limg')] = '';
			await sql.update('join_leave', v, {id: guild.id});
			return 'null';
		}

		if(await _sup(...([type === 'join' ? value[0] : '', type === 'join' ? '' : value[0], '', ''])))
		{
			await sql.update('join_leave', type === 'join' ? {join_txt: value.join(" ")} : {leave_txt: value.join(" ")});
		}

		return value.join(" ");
	},
	async msgupd(db_guild, guild, value, language) {
		if (!value.length) {
			await sql.update('guild_options', { msgupd: '' }, { id: guild.id });
			return 'null';
		}
		const channel = findChannel(guild.channels.cache, value.join(' '));
		if (!channel || channel.type !== 'text')
			return { error: language === 'en' ? 'Channel type must be text' : 'Тип канала должен быть текстовым' };
		await sql.update('guild_options', { msgupd: channel.id }, { id: guild.id });
		return channel.toString();
	},
	async starboardChannel(db_guild, guild, value, language) {
		if (!value.length) {
			await sql.update('guild_options', { starboardChannel: '' }, { id: guild.id });
			return 'null';
		}
		const channel = findChannel(guild.channels.cache, value.join(' '));
		if (!channel || channel.type !== 'text')
			return {
				error: language === 'en' ? 'This channel is not text channel`' : 'Данный канал не является текстовым `'
			};
		await sql.update('guild_options', { starboardChannel: channel.id }, { id: guild.id });
		return channel.toString();
	},
	ignoreNsfw: async function (db_guild, guild, value) {
		value = parseType(String(value[0]));
		value = typeof value === 'number' || typeof value === 'boolean' ? !!value : !db_guild.ignoreNsfw[0];
		await sqlCall(`UPDATE guild_options SET ignoreNsfw = ${+value} WHERE id = '${guild.id}'`);
		return value.toString();
	},
	ignoreChannels: async function (db_guild, guild, value, language) {
		let instruction = {
			add: async channels => {
				if (!channels) return { error: locales.commands.set.guild.ignoreChannels.badValue[language] };

				channels = channels.filter(guild.channels.cache.has, guild.channels.cache);
				if (!channels.length) return { error: locales.commands.set.guild.ignoreChannels.badValue[language] };

				let addedChannels = [];
				for (let channel of channels) {
					// forEach not execute sync
					if (!(await sql.get('ignoreChannels', { id: channel }))) {
						addedChannels.push(channel);
						await sql.insert('ignoreChannels', { id: channel });
					}
				}
				return {
					error: locales.commands.set.guild.ignoreChannels.addedChannels[language].format(
						addedChannels.length,
						addedChannels
							.map(c => `<#${c}>`)
							.join(', ')
							.list(1850, ', ')[0]
					)
				};
			},
			remove: async channels => {
				if (!channels) return { error: locales.commands.set.guild.ignoreChannels.badValue[language] };

				channels = channels.filter(guild.channels.cache.has, guild.channels.cache);
				if (!channels.length) return { error: locales.commands.set.guild.ignoreChannels.badValue[language] };

				let removedChannels = [];
				for (let channel of channels) {
					//forEach not execute sync
					if (await sql.get('ignoreChannels', { id: channel })) {
						removedChannels.push(channel);
						await sql.remove('ignoreChannels', { id: channel });
					}
				}
				return {
					error: locales.commands.set.guild.ignoreChannels.removedChannels[language].format(
						removedChannels.length,
						removedChannels
							.map(c => `<#${c}>`)
							.join(', ')
							.list(1850, ', ')[0]
					)
				};
			},
			addAll: async () => {
				for (let id of guild.channels.cache.keys()) sql.get('ignoreChannels', { id }, id); //forEach not execute sync
				return {
					error: locales.commands.set.guild.ignoreChannels.addedChannels[language].format(
						guild.channels.cache.size,
						'all'
					)
				};
			},
			removeAll: async () => {
				for (let id of guild.channels.cache.keys()) sql.remove('ignoreChannels', { id }); //forEach not execute sync
				return {
					error: locales.commands.set.guild.ignoreChannels.removedChannels[language].format(
						guild.channels.cache.size,
						'all'
					)
				};
			}
		};
		let root = instruction[value[0]];
		if (!root)
			return {
				error: locales.commands.set.guild.ignoreChannels.badArgs[language].format(
					value[0] || 'NV',
					Object.keys(instruction).join(', ')
				)
			};
		else return root(value.join(' ').match(/\d{17,19}/g));
	},
	language: async function (db_guild, guild, value) {
		let access_variables = ['en', 'ru'];
		value = String(value[0]).toLowerCase();
		if (!access_variables.includes(value)) {
			let { language } = db_guild;
			await sqlCall(
				`UPDATE guilds_info SET language = '${(db_guild.language =
					language === 'en' ? 'ru' : 'en')}' WHERE id = '${guild.id}'`
			);
			return `${
				language === 'en'
					? 'ru\nУказанный язык не входит в число доступных.'
					: 'en\nThe specified language is not in the list.'
			} [ru, en]`;
		} else {
			await sqlCall(
				`UPDATE guilds_info SET language = '${(db_guild.language = value)}' WHERE id = '${guild.id}'`
			);
			return value;
		}
	},
	prefix: async function (db_guild, guild, value, language) {
		if (!value.length) return { error: locales.commands.set.guild.prefix.notValue[language] };
		let prefix = value.join(' ').replace(/\ +/g, '');
		if (prefix.length < 1 || prefix.length > 5)
			return { error: locales.commands.set.guild.prefix.badWords[language] };
		db_guild = (await sqlCall(`SELECT * FROM guilds_info WHERE id = '${guild.id}'`))[0]; // Cannot set property '#<TextRow>' of undefined
		await sql.update('guilds_info',{prefix}, {id: guild.id})
		// await sqlCall(`UPDATE guilds_info SET prefix = '${prefix.replace(/'/g, '\\\'')}' WHERE id = '${guild.id}'`);
		return `${db_guild.prefix} -> ${prefix}`;
	},
	async sb_start(db_guild, guild, value, language) {
		if(!value.length) {
			await sql.update('guild_options', {starSize: 3}, {id: guild.id});
			return '3';
		}
		const v = Math.floor(+value[0]);
		if(v < 1 || v > 100)
			return {error: language === 'en' ? 'Count stars for starboard must be in range [1; 100].' : 'Кол-во здвёзд для здвёдной доски должно быть в диапазоне [1; 100].'};
		
		await sql.update('guild_options', {starSize: v}, {id: guild.id});
		await guild.updateData();

		return v.toString();
	}, async roles_jl(db_guild, guild, value, language) {
		const ins = {
			// FORMAT FOR SAVE ROLES:
			// ID;ID;ID;ID
			add: async (args) => {return 'hello';},
			delete: async (args) => {return 'hello';},
			show: async () => {
				let data = await sql.get('join_leave', {id: guild.id});
				if(!data || data.jroles.length == 0) return {error: 'null'};
				data = data.jroles.split(';').map(id => `${id}-><@&${id}>`).join('\n').list(2048, '\n');
				return data.length < 2 ? {error: data[0]} : data;
			}
		};
		const s_oper = ins[value.shift()];
		if(!s_oper) return {error: `set join-leave roles **<${Object.keys(ins).join(', ')}>** <?...>`};
		return (await s_oper(value));
	}
};

// For binding values.
module.exports.variables = {
	guild: {
		logChannel: module.exports.childVriables.logChannel,
		starboardChannel: module.exports.childVriables.starboardChannel,
		ignoreNsfw: module.exports.childVriables.ignoreNsfw,
		ignoreChannels: module.exports.childVriables.ignoreChannels,
		language: module.exports.childVriables.language,
		prefix: module.exports.childVriables.prefix,
		msgupd: module.exports.childVriables.msgupd
	},
	'join-leave': {
		text: module.exports.childVriables.text_jl,
		image: module.exports.childVriables.image_jl,
		roles: module.exports.childVriables.roles_jl
	},
	starboard: {
		stars: module.exports.childVriables.sb_start
	}
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let [guild] = await sqlCall(
		`SELECT * FROM guild_options WHERE id = '${message.guild.id}'`,
		sqlPatterns.guild_options,
		message.guild
	);
	let runIns;
	let [instruction, hinstruction] = args;
	instruction = String(instruction); //.toLowerCase();
	hinstruction = String(hinstruction); //.toLowerCase();
	if (instruction.includes('.')) {
		[instruction, hinstruction] = instruction.split('.');
		args.shift();
	} else args = args.slice(2);
	let selectedIns = instruction,
		selectedHIns = hinstruction;

	if (instruction && !(instruction = module.exports.variables[instruction]))
		return message.channel.send(
			new MessageEmbed().setDescription(
				`${guild.language === 'en' ? 'Available variables: ' : 'Доступные переменные'}:\n${Object.keys(
					module.exports.variables
				)
					.map(key => `* \`${key}[${Object.keys(module.exports.variables[key]).join(',')}]\``)
					.join('\n')}`
			)
		);
	if (hinstruction && !(hinstruction = instruction[hinstruction]))
		return message.channel.send(
			new MessageEmbed().setDescription(
				`${
					guild.language === 'en' ? 'Available children variables' : 'Доступные дочерние переменные'
				}: [${Object.keys(instruction)
					.map(key => `\`${key}\``)
					.join(', ')}]`
			)
		);

	let value = await hinstruction(guild, message.guild, args, language);
	if(value instanceof Array)
	{
		const embed = new MessageEmbed();
		for(const e of value)
		{
			await message.channel.send(embed.setDescription(e));
		}
	}
	else
	{
		await message.channel.send(
			new MessageEmbed()
				.setDescription(
					typeof value === 'string'
						? `${
								guild.language === 'en' ? 'New value for' : 'Новое значение для'
						} \`${selectedIns}.${selectedHIns}\`: ${value}`
						: value.error
				)
		);
	}
};
