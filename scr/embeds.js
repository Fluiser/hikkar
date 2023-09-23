const { MessageEmbed } = require('discord.js');
const locales = process.json;
const { timeFormat, durationFormat } = require('../dist/script/utils.js');
const ytdl = require('ytdl-core');
const avatarOBJ = {}; /*{
    format: "png",
    size: "1024"
};*/
const imageFormat = ['png', 'jpg', 'jpeg', 'bmp', '.jpeg'];

module.exports.ownerCmd = (user, language = 'en') => {
	return new MessageEmbed()
		.setAuthor(user.username, user.avatarURL(avatarOBJ))
		.setDescription(language === 'en' ? 'This command only $sudo users.' : 'Это команда только $sudo пользователей')
		.setColor('#FF0000');
};

module.exports.onlyPremium = (user, language = 'en') => {
	return new MessageEmbed()
		.setAuthor(user.username, user.avatarURL(avatarOBJ))
		.setDescription(
			language === 'en'
				? 'This command only premium users, sorry.'
				: 'Простите, но это команда только для премиум пользователей. :c'
		)
		.setColor('#FF0000');
};

module.exports.notPermissions = (user, permissions, language = 'en') => {
	return new MessageEmbed()
		.setAuthor(user.username, user.avatarURL(avatarOBJ))
		.setDescription(
			language === 'en'
				? `You don't have this permissions: \`${permissions.join(', ')}\``
				: `У вас недостаточно прав для этой команды.\nНеобходимые права: \`${permissions
						.map(perm => process.scr.ruPermissions[perm])
						.join(', ')}\``
		)
		.setColor('#FF0000');
};

module.exports.newlevel = (user, language = 'en') => {
	//TODO: Make newlevel image.
	return new MessageEmbed()
		.setAuthor(user.username, user.avatarURL(avatarOBJ))
		.setDescription(`<@${user.id}>, ${language === 'en' ? 'you have a new level!' : 'У тебя новый уровень!'}`)
		.setImage('https://i.imgur.com/XMTQMLK.png');
};

module.exports.noArgs = (message, language = 'en') => {
	return new MessageEmbed()
		.setAuthor(message.author.username, message.author.avatarURL(avatarOBJ))
		.setDescription(language === 'en' ? 'Your not define args.' : 'Вы не определили необходимые аргументы.');
};

module.exports.cannotFindWeatherLocation = (str, language = 'en') => {
	return new MessageEmbed()
		.setDescription(`${language === 'en' ? 'I cannot find' : 'Я не смогла найти'} \`${str}\` :c`)
		.setColor('#FF0000');
};

module.exports.osu = (user, language = 'en') => {
	const { a, s, ss } = process.osuemojis;
	return new MessageEmbed()
		.setThumbnail(`http://s.ppy.sh/a/${user.user_id}`)
		.setDescription(
			`${language === 'en' ? 'User' : 'Юзер'}: [**${user.username}**](https://osu.ppy.sh/users/${
				user.user_id
			})\n` +
				`${language === 'en' ? 'Country' : 'Страна'}: **${user.country}**\n` +
				`${language === 'en' ? 'Registered on' : 'Зарегестрировался'}: **${timeFormat(
					new Date(user.join_date),
					language
				)}**\n` +
				`${language === 'en' ? 'Play count' : 'Сыграл раз'}: **${(+user.playcount).format()}**\n`
		)
		.addField(
			language === 'en' ? 'Score' : 'Скор',
			`PP: **${(+user.pp_raw.replace(/(\..{2}).+/g, '$1')).format()}**\n` +
				`${language === 'en' ? 'Total score' : 'Всего очков'}: **${(+user.total_score).format()}**\n` +
				`${language === 'en' ? 'Ranked score' : 'Рейтинговые очки'}: **${(+user.ranked_score).format()}**\n` +
				`${language === 'en' ? 'Rank' : 'Ранг'}: **#${(+user.pp_rank).format()}**\n` +
				`${language === 'en' ? 'Country rank' : 'Ранг по стране'}: **#${(+user.pp_country_rank).format()}**\n` +
				`${language === 'en' ? 'Level' : 'Уровень'}: **${(+user.level).toFixed(2)}**\n` +
				`${language === 'en' ? 'Accuracy' : 'Аккуратность'}: **${(+user.accuracy).toFixed(2)}%**\n`,
			true
		)
		.addField(
			language === 'en' ? 'Counter#1' : 'Счётчик#1',
			`50: **${(+user.count50).format()}**\n100: **${(+user.count100).format()}**\n300: **${(+user.count300).format()}**`,
			true
		)
		.addField(
			language === 'en' ? 'Counter#2' : 'Счётчик#2',
			`${a}: **${(+user.count_rank_a).format()}**\n${s}: **${(+user.count_rank_s).format()}**\n${ss}: **${(+user.count_rank_ss).format()}**\n`,
			true
		);
};

module.exports.weatherLocation = (weather, language = 'en') => {
	let index = new MessageEmbed();

	index.setAuthor(`${weather.location.name} [${weather.location.lat}:${weather.location.long}]`);
	index.setThumbnail(weather.current.imageUrl);
	index.setDescription(
		`**${weather.current.day}**\n${language === 'en' ? 'Temperature' : 'Температура'}: **${
			weather.current.temperature
		}${weather.location.degreetype}**\n${language === 'en' ? 'Sky' : 'Небо'}: **${weather.current.skytext}**\n${
			language === 'en' ? 'Wind speed' : 'Скорость ветра'
		}: **${weather.current.winddisplay}**\n${language === 'en' ? 'Time' : 'Время'}: **${
			weather.current.observationtime
		}** [\`${weather.current.observationpoint}\`]\n${language === 'en' ? 'Feels like' : 'Ощущается'}: **${
			weather.current.feelslike
		}${weather.location.degreetype}**\n${language === 'en' ? 'Humidity' : 'Влажность'}: **${
			weather.current.humidity
		}%**`
	);

	for (let forecast of weather.forecast.filter(fc => fc.date !== weather.current.date).slice(1)) {
		index.addField(
			`${forecast.day} (${forecast.date})`,
			`${language === 'en' ? 'Low' : 'Наименьшая'}: **${forecast.low}**\n${
				language === 'en' ? 'High' : 'Наивысшая'
			}: **${forecast.high}**\n${language === 'en' ? 'Sky' : 'Небо'}: **${forecast.skytextday}**`,
			true
		);
	}

	return index;
};

module.exports.invalidArgs = (message, str) => {
	return new MessageEmbed()
		.setColor('#FF0000')
		.setAuthor(message.author.username, message.author.avatarURL(avatarOBJ))
		.setDescription(str);
};

module.exports.error = (message, str) => {
	return new MessageEmbed()
		.setColor('#ff0000')
		.setDescription(str)
		.setAuthor(message.author.username, message.author.avatarURL(avatarOBJ));
};

module.exports.casino = (message, str, exp, rate, money, language = 'en') => {
	return new MessageEmbed()
		.setColor(exp < 1 ? '#ff0000' : '#00FF00')
		.setDescription(
			`${str} [\`${exp.toFixed(2)}\`|${language === 'en' ? 'Your crystals' : 'Ваши кристаллы'}: **${money}** ${
				process.moneyEmoji
			}]\n${
				language === 'en'
					? rate < exp * rate < 1
						? 'You lose! :c'
						: 'You win! :3'
					: rate < exp * rate < 1
					? 'Ты проиграл! :c'
					: 'Ты выйграл! :3'
			}`
		)
		.setAuthor(language === 'en' ? 'Casino' : 'Казино', message.author.avatarURL(avatarOBJ));
};

module.exports.debugError = err => {
	return new MessageEmbed()
		.setDescription(
			`\`\`\`js\n${
				typeof err === 'string' ? err : err instanceof Error ? err.stack : JSON.stringify(err, undefined, ' ')
			}\`\`\``
		)
		.setColor('#ff0000');
};

module.exports.evalOut = obj => {
	let index = `${obj.result && obj.result.stack ? obj.result.stack : obj.result}`;

	if (index.length > 2030) index = index.slice(0, 2030) + '...';
	return new MessageEmbed()
		.setDescription(`\`\`\`js\n${index}\`\`\``)
		.setAuthor(`${obj.time} sec`);
};

module.exports.ban = (data, language = 'en') => {
	return new MessageEmbed()
		.setColor(0xff0000)
		.setDescription(
			locales.system.moderation.ban[language].format(
				data.user.tag,
				data.data.time,
				data.moderator.user.tag,
				data.reason
			)
		);
};

module.exports.kick = (data, language = 'en') => {
	return new MessageEmbed()
		.setColor(0xffff00)
		.setDescription(
			locales.system.moderation.kick[language].format(data.user.tag, data.moderator.user.tag, data.reason)
		);
};

module.exports.mute = (data, language = 'en') => {
	return new MessageEmbed()
		.setColor(0xffff00)
		.setDescription(
			locales.system.moderation.mute[language].format(
				data.user.tag,
				data.data.time,
				data.moderator.user.tag,
				data.reason
			)
		);
};

module.exports.message = message => {
	let embed = new MessageEmbed()
		.setAuthor(
			`${message.channel.type === 'dm' ? 'dm' : message.guild.name}: ${message.author.username}`,
			message.author.avatarURL(avatarOBJ)
		)
		.setFooter(`User id: ${message.author.id}`);
	embed.setDescription(message.content);
	let attachmentsText = '',
		proxyAttachmentsText = '';
	for (let attachment of message.attachments.array()) {
		attachmentsText += `[${attachment.name}](${attachment.url})\n`;
		proxyAttachmentsText += `[${attachment.name}](${attachment.proxyURL})\n`;
	}
	if (message.attachments.size) {
		embed.addFields(
			{
				name: `Attachments[${message.attachments.size}]`,
				value: attachmentsText
			},
			{
				name: `ProxyAttachments[${message.attachments.size}]`,
				value: proxyAttachmentsText
			}
		);
		let attachments = message.attachments.filter(file =>
			imageFormat.some(format => file.name.toLowerCase().endsWith(format))
		);
		if (attachments.size) embed.setImage(attachments.first().url);
	}

	return embed;
};

module.exports.mediaSource = async (message, source, language) => {
	let embed = new MessageEmbed();
	if (ytdl.validateURL(source.url)) {
		return new Promise(async resolve => {
			embed.setDescription(
				`[**${source.title}**](${source.url})\n` +
					`${language === 'en' ? 'Duration' : 'Длительность'}: ${durationFormat(
						source.seconds * 1000,
						language
					)}\n` +
					`${language === 'en' ? 'Author' : 'Автор'}: ${source.channelTitle}\n` +
					`${language === 'en' ? 'From' : 'От'}: <@${message.author.id}>\n`
			);
			try {
				embed.setImage(Object.entries(source.thumbnails).last()[1].url);
			} catch {
				embed.setImage('https://i.imgur.com/qejGv4Y.png');
			}
			resolve(embed);
		});
	} else
		embed.setDescription(
			`[**${source.name}**](${source.url})\n${language === 'en' ? 'Duration' : 'Длительность'}: N/A\n${
				language === 'en' ? 'Author' : 'Автор'
			}: <@${message.author.id}>`
		);
	return embed;
};

module.exports.transfer = (message, q, user, lang = 'en') => {
	return new MessageEmbed().setDescription(
		`${lang === 'en' ? 'Sender' : 'Отправитель'}: ${message.author}\n` +
			`${lang === 'en' ? 'Recipient' : 'Получатель'}: ${user}\n` +
			`${lang === 'en' ? 'Sum' : 'Сумма'}: **${q}**${process.moneyEmoji}\n` +
			`${lang === 'en' ? 'Commission' : 'Комиссия'}: **${Math.round(q * 0.05)}**${process.moneyEmoji} (5%)\n` +
			`${lang === 'en' ? 'Received including commission' : 'Получено с учетом комиссии'}: **${Math.floor(
				q * 0.95
			)}**${process.moneyEmoji} (95%)`
	);
};

/*
 * @ReturnType {Embed}
 * */
module.exports.starMessage = message => {
	const embed = new MessageEmbed().setDescription(`[🔗](${message.url}) ${message.content}`);
	const image = message.attachments.find(file => imageFormat.some(type => file.name.endsWith(type))) 			||
				  (message.embeds.find(e => e.thumbnail && e.thumbnail.url) || {}).thumbnail 					||
				  (message.content.match(/https:\/\/i\.imgur\.com\/[\w\d]+\.(?:png|gif|jpg|jpeg)/) || [])[0];
	if (image) embed.setImage(image.url);
	if (image && message.attachments.size > 1) {
		let str = [];
		for (const attachment of message.attachments.values()) {
			const name = attachment.name.replace(/^(.{0,15}).*(\.\w+)/, '$1$2');
			str.push(`[${name}](${attachment.url})`);
		}
		str = str.join('\n').list(1024, '\n').slice(0, 2);
		for (const setStr of str) embed.addField('Files', setStr);
	}
	embed.setAuthor(message.author.tag || 'is dead', message.author.displayAvatarURL())
	return embed;
};
