const { durationFormat, timeFormat, spotifyTime, sqlCall } = process.scr.utils;
const { userinfo } = process.json.locales.commands;
const { sql } = process.scr;
const { MessageEmbed } = require('discord.js');
const avatarOBJ = {
	format: 'png',
	size: 4096
};

module.exports.help = {
	name: ['userinfo', 'uinfo', 'u-info', 'user', 'юзеринфо', 'юинфо', 'юзер'],
	usage: {
		en: 'userinfo *<user>',
		ru: 'юзеринфо *<пользователь>'
	},
	description: {
		en: 'Show information about user.\nIf the user is not declared, then user become message author.',
		ru: 'Показывает инфомацию о указанном юзере.\nЕсли юзер не указан, то в качестве его будет подобран автор сообщения.'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'standart'
};

module.exports.devices = {
	browser: 'Браузера',
	mobile: 'Телефона',
	desktop: 'Клиента',
	unknow: 'Неизвестно',
	web: 'Веб'
};

module.exports.activityStr = (act, language = 'en') => {
	if (Array.isArray(act)) return act.map(element => module.exports.activityStr(element, language));
	let index = { text: '', images: [] };

	let types = {
		PLAYING: 0,
		STREAMING: 1,
		LISTENING: 2,
		WATCHING: 3,
		CUSTOM_STATUS: 4
	};

	let ru = {
		details: 'Детали',
		state: 'Статус'
	};

	if (typeof act.type === 'string') act.type = types[act.type];
	if (act.assets)
		for (let key of ['largeImageURL', 'largeImageURL']) {
			if (act.assets[key]) index.images.push(act.assets[key](avatarOBJ));
		}

	switch (act.type) {
		case 0:
			index.text += `${language === 'ru' ? 'Играет в' : 'Playing'} **${act.name}**`;
			for (let key of ['state', 'details']) {
				if (act[key])
					index.text += '\n' + (language === 'en' ? `${key}: ${act[key]}` : `${ru[key]}: ${act[key]}`);
			}
			if (act.timestamps && act.timestamps.start)
				index.text += `\n${durationFormat(Date.now() - new Date(act.timestamps.start).getTime(), language)}`;
			break;
		case 1:
			index.text += `${language === 'ru' ? 'Стримит' : 'Streaming'} [**${act.name}**](${
				act.url || 'https://i.imgur.com/LVzhiGv.png'
			})`; // Кикай его к хуям, это бот, у него нету ссылки на трансляцию.
			break;
		case 2:
			if (act.name === 'Spotify') {
				index.text += `${language === 'ru' ? 'Слушает' : 'Listening'}: `;
				if (act.details) index.text += `**${act.details}**`;
				else index.text += '**N/A**';
				if (act.state) index.text += `\n${language === 'en' ? 'Artist' : 'Артист'}: **${act.state}**`;
				if (act.assets && act.assets.largeText)
					index.text += `\n${language === 'en' ? 'Album' : 'Альбом'}: **${act.assets.largeText}**`;
				if (act.timestamps)
					index.text += `\n${language === 'en' ? 'Time' : 'Время'}: **${spotifyTime(act.timestamps)}**`;
			} else index.text += `${language === 'ru' ? 'Слушает' : 'Listening'} **${act.name}**:`;
			break;
		case 3:
			index.text += `${language === 'ru' ? 'Смотрит' : 'Wathing'} [**${act.name}**](${
				act.url || 'https://i.imgur.com/3tVGBZo.png'
			})`;
			break;
		case 4:
			index.text += `${language === 'ru' ? 'Имеет статус' : 'Custom status'} **${act.state || act.emoji.name}**`;
			break;
		default:
			index.text += `Unknown type: ${act.type}`;
			break;
	}
	return index;
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let argsUser = (await message.guild.members.resolve(args[0])) || message.mentions.members.first() || message.member;
	let profile = argsUser.user.bot ? {} : await sql.get('profiles', { id: argsUser.id }, argsUser);
	let waifu = argsUser.user.bot
		? null
		: await sqlCall(`SELECT * FROM waifu WHERE id = '${argsUser.id}' or waifu_id = '${argsUser.id}'`);
	const activity = module.exports.activityStr(
		argsUser.presence.activities.filter(a => a.type !== 4),
		language
	);

	let status = argsUser.user.presence.activities && argsUser.user.presence.activities.filter(a => a.type === 4);
	status = status.length
		? `${language === 'ru' ? 'Имеет статус' : 'Custom status'} **${status[0].state || status[0].emoji.name}**`
		: '';

	let statuses = {
		online: `${await bot.emojis.resolve('516884210305466379')} **${language === 'en' ? 'Online' : 'В сети'}**`,
		idle: `${await bot.emojis.resolve('516884210208866314')} **${language === 'en' ? 'Idle' : 'Не активен'}**`,
		dnd: `${await bot.emojis.resolve('516884210057871361')} **${
			language === 'en' ? 'Do not disturb' : 'Не беспокоить'
		}**`,
		offline: `${await bot.emojis.resolve('516884210225512468')} **${language === 'en' ? 'Offline' : 'Не в сети'}**`,
		unknow: `${await bot.emojis.resolve('516884210225512468')} **${
			language === 'en' ? 'Wtf, dude?' : 'Если бы мы знали, что это такое, но мы не знаем, что это такое.'
		}**`
	};

	waifu = !argsUser.user.bot && {
		owner: waifu.find(w => w.waifu_id === argsUser.id) || undefined,
		waifus: waifu.filter(w => w.id === argsUser.id) || undefined
	};

	let devices;

	if (argsUser.presence.clientStatus) {
		devices = Object.keys(argsUser.presence.clientStatus);
		if (!devices.length) devices = ['unknow'];
	} else devices = ['unknow'];

	let embed = new MessageEmbed()
		.setAuthor(argsUser.user.username, argsUser.user.avatarURL(avatarOBJ))
	embed.setDescription(`${status}\n${activity.map(a => a.text).join('\n\n')}\n
			${statuses[argsUser.user.presence.status] || statuses.unknow}
			${language === 'en' ? 'Online from: ' : 'Онлайн с'}: ${devices
		.map(e => `**${language === 'en' ? e : module.exports.devices[e]}**`)
		.join(', ')}
			${language === 'en' ? 'Reputation' : 'Репутация'}: **${profile.reputation || 0}**

			${
				profile.about ||
				(argsUser.user.bot
					? argsUser.id === bot.user.id
						? userinfo.userBot.self[language]
						: userinfo.userBot.another[language]
					: 'N/A')
			}`);
	embed.addField(
		language === 'en' ? 'Registration date' : 'Дата регистрации',
		`${timeFormat(argsUser.user.createdTimestamp, language)}
			(${durationFormat(Date.now() - argsUser.user.createdTimestamp, language)})`,
		true
	);
	embed.addField(
		language === 'en' ? 'Join date' : 'Дата подключения',
		`${timeFormat(argsUser.joinedTimestamp, language)}
			(${durationFormat(Date.now() - argsUser.joinedTimestamp, language)})`,
		true
	);
	if (!argsUser.user.bot) {
		for (let i = 0; i < waifu.waifus.length; ++i) {
			let id = waifu.waifus[i].waifu_id;
			waifu.waifus[i] = await bot.users.resolve(id);
			if (!waifu.waifus[i]) {
				sqlCall(`DELETE FROM waifu WHERE id = '${id}' OR waifu_id = '${id}'`);
			}
		}
		waifu.waifus = waifu.waifus.filter(w => w);

		embed.addField(language === 'en' ? 'Send messages' : 'Отправил сообщений', profile.messages, true);
		embed.addField(
			language === 'en' ? 'Owner' : 'Владелец',
			waifu.owner
				? (waifu.owner = await bot.users.resolve(waifu.owner.id))
					? waifu.owner.tag
					: language === 'en'
					? 'is dead'
					: 'Потерялся. :c'.url
				: 'NV',
			true
		);
		embed.addField(
			`${language === 'en' ? 'Waifus' : 'Вайфу'}[${waifu.waifus.length}]`,
			waifu.waifus.map(w => w.tag).join('\n') || 'NV',
			true
		);
		// embed.addField(language === 'en' ? 'Reputation' : `Репутация`, profile.reputation, true);

		const _thumbnail = activity.find(a => a.images.length);
		if(_thumbnail)
			embed.setThumbnail(_thumbnail.images[0]);
	}
	await message.channel.send(embed);
};
