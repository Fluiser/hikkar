require('superagent'); // Prototypes error.
require('./scr/script/prototypes.js'); // prototypes initialize
require('./scr/script/SETDIRS.js'); // process variables set
const Discord = require('discord.js');
const bot = new Discord.Client();
try {
	bot.version = require('./package.json').version;
} catch {}
const config = require('./json/bot_config');
const webhData = require('./json/webh.json');
const mainWebHook = new Discord.WebhookClient(webhData.main.id, webhData.main.token);
const debugWebHook = new Discord.WebhookClient(webhData.debug.id, webhData.debug.token);
const commandsWebhook = new Discord.WebhookClient(webhData.cw.id, webhData.cw.token);
process.ytApi = new process.scr.instruction.ytApi.youtube(config.googleKey);

require('./scr/script/logger.js')(
	`${__dirname}/logs/${(() => {
		const date = new Date();
		return `${date.getHours()}-${date.getMinutes()} ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
	})()}.log`,
	[
		{
			write: function (str) {
				process.emit('system', str);
			}
		}
	]
);
//В какой-то мере это неправильно, но с другой стороны - 
//Что сделает глобальный определитель?
global.imageFormat = ['png', 'jpg', 'jpeg', 'bmp', 'jpeg', '.gif'];
const { embeds } = process.scr;
const { sql, sqlPatterns } = process.scr;
const { sqlCall, mathLevel } = process.scr.utils;
const { locales } = process.json;
const blockedUsers = (process.blockedUsers = new Set());
let CollectionCmds;
require('./scr/script/commandLoader.js')().then(r => (process.collectionCmds = CollectionCmds = r));
const players = process.players = new Discord.Collection();
process.sqlConnect(config.database);
process.bot = bot;
process.osu = new process.scr.instruction.osu(config.osu);
process.sudoUsers = config.owner;
const { mute } = process.scr.instruction;
require('./child_events')(process.bot); // Child events initialization

// process.scr.instruction.game.loadTextures();

const levelLock = new Map();

async function __mute_handle() {
	const mutes = await sql.getAll('mute');
	for (const _d of mutes) {
		if (mute.d_handle(_d.time, false) < Date.now()) {
			await mute.remove(_d.user_id, _d.guild_id);
			const guild = bot.guilds.cache.get(_d.guild_id);
			if (!guild) continue;
			const member = await guild.members.fetch(_d.user_id);
			if (!member) continue;
			await member.roles.add(_d.roles.filter(r_id => !member.roles.cache.has(r_id)));
		} else if (Date.now() - mute.d_handle(_d.time, false) < 21500000) {
			setTimeout(async () => {
				await mute.remove(_d.user_id, _d.guild_id);
				const guild = bot.guilds.cache.get(_d.guild_id);
				if (!guild) return;
				const member = await guild.members.fetch(_d.user_id);
				if (!member) return;
				await member.roles.add(_d.roles.filter(r_id => !member.roles.cache.has(r_id)));
			}, Date.now() - mute.d_handle(_d.time, false));
		}
	}
}

bot.on('ready', async () => {
	console.log(bot.user.tag);

	if(typeof bot.shard === 'undefined' || bot.shard === null) {
		bot.user.setPresence({activity: {name: `C.g.: ${bot.guilds.cache.size}|@${bot.user.username} help`}, status: 'dnd'});
		setInterval(() => bot.user.setPresence({activity: {name: `C.g.: ${bot.guilds.cache.size}|@${bot.user.username} help`}, status: 'dnd'}), 60000);
	}

	process.moneyEmoji = await bot.emojis.resolve('600820528751837203'); // money emoji
	process.osuemojis = {
		a: '589112328205893653',
		s: '589112274652889088',
		ss: '589112210416992315'
	};
	for (let [key, value] of Object.entries(process.osuemojis))
		process.osuemojis[key] = await bot.emojis.resolve(value);
	setTimeout(() => {
		if (global.gc) global.gc();
		for (const [key, value] of levelLock) {
			if (Date.now() - value >= 60000) levelLock.delete(key);
		}
	}, 1000 * 60 * 60 * 4 /* 4 hours*/);
	await __mute_handle();
	setInterval(__mute_handle, 21600000); // 21600000 - 6h
});

bot.login(config.TOKEN).catch(console.log);

bot.on('message', async message => {
	if (message.author.bot || !message.member /*Вероятно из-за того, что существует какая-нибудь дрянь, которая не member и не bot.*/) return;
	if (blockedUsers.has(message.author.id)) {
		if (message.guild.owner && blockedUsers.has(message.guild.owner.id)) await message.guild.leave();
		return;
	}
	if (message.channel.type !== 'text') {
		if(message.channel.type === 'dm')
			mainWebHook.send(embeds.message(message));
		return;
	}
	if (!message.channel.hasBotPermission('SEND_MESSAGES')) return;


	if (
		!(message.member.hasPermission('ADMINISTRATOR') || config.owner.includes(message.author.id) ) &&
		(await sql.get('ignoreChannels', { id: message.channel.id }))
	)
		return;

	let args = message.content.replace(/ +/g, ' ').split(' ');
	let [guild] = await sqlCall(
		`SELECT * FROM guilds_info WHERE id = '${message.guild.id}'`,
		process.scr.sqlPatterns.guilds_info,
		message.guild
	);

	{
		const muser = message.mentions.users.first();
		if((muser && muser.id) === bot.user.id)
		{
			if(args.length == 1) return await message.channel.send(locales.system.mention_bot[guild.language].format(guild.prefix));
			if(['помоги', 'алло', 'помощь', 'help', 'вставай'].includes(args[1].toLowerCase())) {
				args.shift(); // mention
				args.shift(); // help/allo.
				CollectionCmds.get('help').run(bot, message, args, guild.language, guild);
				return;
			}
		}
	}

	let [user] = await sqlCall(
		`SELECT * FROM profiles WHERE id = '${message.author.id}'`,
		process.scr.sqlPatterns.profiles,
		message.author
	);
	let cmd = args.shift().toLowerCase().slice(guild.prefix.length);
	if (message.content.startsWith(guild.prefix) && (cmd = CollectionCmds.get(cmd))) {
		if (cmd.broken && !config.owner.includes(message.author.id))
			return message.channel.send(
				guild.language === 'en' ? "Sorry, it's command is broken. :c" : 'Простите, эта команда не работает. :c'
			);
		if (cmd.help.owner && !config.owner.includes(message.author.id))
			return await message.channel.send(embeds.ownerCmd(message.author, guild.language));
		if (cmd.help.permissions.some(perm => !message.member.hasPermission(perm)))
			return await message.channel.send(
				embeds.notPermissions(
					message.author,
					cmd.help.permissions.filter(p => !message.member.hasPermission(p)),
					guild.language
				)
			);
		let member_bot = await message.guild.members.resolve(bot.user.id);
		if (cmd.help.bot_permissions.some(perm => !member_bot.hasPermission(perm))) return;
		// cmd.__variables = {
		// 	guild
		// };
		commandsWebhook.send(`${message.author.username} ${message.author.id} ${message.content.slice(0, 1940)}`);
		await cmd.run(bot, message, args, guild.language).catch(async e => {
			if (e instanceof Error && e.message && e.message.includes('Internal Server Error')) {
				await message.channel.send(locales.system.DiscordError[guild.language]);
				return;
			}
			bot.emit('system_error', e, message);
			await message.channel.send(
				locales.system.doBrockenCmd[guild.language] +
					(bot.emojis.cache.get('595956031801262131') || '').toString()
			); // bob emoji
			cmd.broken = true;
		});
	} else {
		if (!levelLock.has(message.author.id) || Date.now() - levelLock.get(message.author.id) >= 60000 /*minute*/) {
			const [member] = await sqlCall(
				`SELECT * FROM memberslevel WHERE id = '${message.author.id}' AND guild_id = '${message.guild.id}'`,
				sqlPatterns.memberslevel,
				message.author,
				message.guild
			);
			const rand = () => Math.random() * 5; //Math.floor(Math.random() * 25) + 5;

			member.xp += rand();
			user.xp += rand();

			let profileLevel = mathLevel({
					level: user.level,
					xp: user.xp
				}),
				memberLevel = mathLevel({
					level: member.level,
					xp: member.xp
				});
			levelLock.set(message.author.id, Date.now());
			await sqlCall(
				`UPDATE profiles SET level = ${profileLevel.level}, xp = ${Math.floor(profileLevel.xp)} WHERE id = '${
					message.author.id
				}'`
			);
			await sqlCall(
				`UPDATE memberslevel SET level = ${memberLevel.level}, xp = ${Math.floor(memberLevel.xp)} WHERE id = '${
					message.author.id
				}' AND guild_id = '${message.guild.id}'`
			);
		}
		//if(user.level !== profileLevel.level || memberLevel.level !== member.level) message.channel.send(embeds.newlevel(message.author, guild.language)).then(msg => msg.delete({timeout: 5500}));
		//need new level image.
	}
	await sqlCall(`UPDATE profiles SET messages = ${user.messages + 1} WHERE id = '${message.author.id}'`);
	await sqlCall(`UPDATE guilds_info SET messages = ${guild.messages + 1} WHERE id = '${message.guild.id}'`);
});

bot.on('system', async (message, cmd, ...args) => {
	if (!cmd && message && !(message instanceof Discord.Message)) cmd = message;
	if (typeof cmd !== 'object') return bot.emit('system_error', new TypeError('Cmd on event system is not object.'));
	if (cmd.type === 'eval') {
		let result;
		try {
			result = cmd.code ? eval(cmd.code) : (cmd.run || cmd.exe)(...args);
			if (result instanceof Promise) result = await result;
		} catch (error) {
			result = error;
		}

		if (message instanceof Discord.Message)
			message.channel.send(result instanceof Error ? embeds.debugError(result) : embeds.evalOut(result));
	}
});

bot.on('system_error', (error, message) => {
	debugWebHook.send(message ? `${message.author.id}: ${message.content.slice(0, 1950)}` : 'PROCESS_ERROR', embeds.debugError(error));
});

process.on('unhandledRejection', (error, promise) => {
	bot.emit('system_error', error);
});

process.on('system', data => {
	if (typeof data !== 'string' || data.length <= 2039) debugWebHook.send('SYSTEM', embeds.debugError(data));
});


//TODO: Need a be realisation.
bot.on('moderation', async (data, language) => {
	let guild = await sqlCall(
		`SELECT * FROM guild_options WHERE id = '${data.guild.id}'`,
		sqlPatterns.guild_options,
		data.guild
	);
	if (!guild.moderationChannel) return;
	let channel;

	try{
		channel = await bot.channels.fetch(guild.moderationChannel);
	} catch {
		await sql.update('guild_options', {moderationChannel: ''}, {id: data.guild.id});
		return;
	}
	// {
	// 	type: 'string',
	// 	moderator: message.author,
	// 	user: member,
	// 	guild: message.guild,
	// 	reason,
	//	data: {}
	// }

	if (!embeds[data.type]) {
		process.emit('system', `embeds not found: ${data.type}`);
		return;
	}

	try {
		if (!channel || !channel.hasBotPermission(['SEND_MESSAGES', 'EMBED_LINKS'])) throw { httpStatus: 403 };
		await channel.send(embeds[data.type](data, language));
	} catch (err) {
		if (err.httpStatus === 403) {
			await sql.update('guild_options', { moderationChannel: '' }, { id: data.guild.id });
			if (data.guild.owner && data.guild.owner.already_smsg) {
				data.guild.owner.already_smsg = true;
				try {
					await data.guild.owner.send(
						language === 'en'
							? `Bot cannot send message and embed link in channel <moderationChannel> from guild ${data.guild.name} (${data.guild.id}).\nMod. channel removed from settings.`
							: `Бот не может написать сообщение и добавить ссылку в канале <moderationChannel> на сервере ${data.guild.name} (${data.guild.id})\nМод. канал был удалён из настроек.`
					);
				} catch {}
			}
		} else {
			process.emit('system', err);
		}
	}
});

bot.on('voiceStateUpdate', async (oldstatus, newstatus) => {
	if(oldstatus.member.user.bot || !oldstatus.member.id) return;
	if(!oldstatus.channel) return;
	let hasBot = false;
	if (oldstatus.channel.members.filter(m => {if(m.user.id === bot.user.id) hasBot = true; return !m.user.bot;}).size <= 0 /*wha*/) {
		if (players.get(oldstatus.channel.id) && hasBot) players.get(oldstatus.channel.id).stop();
	}

	if (!newstatus.channel && oldstatus.member.id === bot.user.id) {
		let channel = players.get(oldstatus.channel.id);
		if (channel) channel.stop();
	}
});

//@load events
{
	//Events must be loaded before initialized client, I think...
	const { readdirSync } = require('fs');
	for(const path of readdirSync('./events'))
	{
		if(!path.endsWith('.js')) continue;
		const _export = require(`./events/${path}`);
		if(Array.isArray(_export))
			for(const prop of _export)
			{
				bot.on(prop.e, prop.r);
			}
		else
			bot.on(_export.e, _export.r);
	}
}
