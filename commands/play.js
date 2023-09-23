const { embeds } = process.scr;
const { player } = process.scr.instruction;
const { ytApi } = process;
const { durationFormat } = process.scr.utils;
const { validateURL } = require('ytdl-core');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { locales } = process.json;

module.exports.help = {
	name: ['play', 'плей', 'музыка', 'баян', 'p'],
	usage: {
		en: 'play *<url of video youtube> *<mediaFile>',
		ru: 'сказать *<ссылка на видео youtube>'
	},
	description: {
		en: 'Playing music in voice channel.',
		ru: 'Проигрывает музыку в голосовом канале.'
	},
	permissions: ['CONNECT', 'SPEAK'],
	bot_permissions: ['CONNECT', 'SPEAK', 'VIEW_CHANNEL', 'MANAGE_CHANNELS'],
	owner: false,
	tag: 'music'
};

module.exports.help.availableFormats = ['mp4', 'mp3', 'webm'];

module.exports.run = async (bot, message, args, language = 'en') => {
	let s = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣'];
	let { channel } = message.member.voice;
	let source = args[0];
	if (!channel) return message.channel.send(embeds.error(message, locales.commands.play.notVoice[language]));
	if (message.guild.voice && message.guild.voice.channel && message.guild.voice.channel.id !== channel.id)
		return message.channel.send(embeds.error(message, locales.commands.play.already_play[language]));
	if (!source) {
		source = message.attachments.first();
		if (source && source.size > 8388608) {
			await message.channel.send(locales.commands.play.oversize_file[language].format(8));
			return;
		}
	} else if (source.match(/list=([^&]+)/g)) {
		source = source
			.match(/list=([^&]+)/g)[0]
			.split('=')
			.pop();
		source = await ytApi.getPlaylist(source);
		if (source && source.items && source.items.length) source.items = source.items.reverse();
	} else {
		if (!validateURL(source)) {
			let resultSearch = await ytApi.search(args.join(' '));
			// for (let i = 0; i < 2 && !resultSearch.length; ++i)
			//     resultSearch = await search(args.join(" "));
			resultSearch = resultSearch.slice(0, 9);
			if (!resultSearch.length)
				return message.channel.send(embeds.error(message, locales.commands.play.notMatch[language]));
			s = s.slice(0, resultSearch.length);
			let msg = await message.channel.send(
				new MessageEmbed().setDescription(
					resultSearch
						.map(
							(e, i) =>
								`${s[i]}: [**${e.title.length > 70 ? e.title.slice(0, 67) + '...' : e.title}**](${
									e.url
								}) [${durationFormat(e.seconds * 1000, language)}]`
						)
						.join('\n')
				)
			);
			// console.log($__.slice(0, 100), $__.description.length);
			for (let i = 0; i < s.length && i < resultSearch.length; ++i) {
				msg.react(s[i]);
			}
			let song = await msg.awaitReactions(
				(reaction, user) => s.includes(reaction.emoji.name) && user.id === message.author.id,
				{
					maxEmojis: 1,
					time: 1000 * 60 * 20 // 20 min
				}
			);
			if (!song.size) return;
			try {
				song = resultSearch[s.indexOf(song.keys().next().value)] || resultSearch[0]; // Fucking iterators. Idk, it's maybe drop error AKA it's fucking value cannot read of undefined.
			} catch {
				song = resultSearch[0];
			}
			source = song;
		}
	}
	if (!source || (!source && !module.exports.help.availableFormats.includes(source.name.split('.').pop())))
		return message.channel.send(embeds.error(message, locales.commands.play.invalidFormatFile[language]));
	let voice = process.players.get(channel.id);
	if (!voice)
		process.players.set(
			channel.id,
			(voice = new player.Manager(channel, language)).on('end', () => {
				process.players.delete(channel.id);
			})
		);

	if (!voice.connection)
		try {
			await voice.join();
		} catch (err){
			console.log(err);
			await message.channel.send(embeds.error(message, locales.system.player.errorConnect[language]));
			return;
		}

	if (source.url) {
		await message.channel.send(await embeds.mediaSource(message, source, language));
	} else if (Array.isArray(source)) {
		await message.channel.send(
			await embeds.mediaSource(
				message,
				Object.assign(source[0], { seconds: await ytApi.getDuration(source[0].url) }, source[0].snippet),
				language
			)
		);
		for (let video of source) await voice.push(message.author, video.url);
		return;
	}
	try {
		await voice.push(message.author, typeof source === 'object' ? source.url : source);
	} catch (err) {
		await message.channel.send((language === 'en' ? "Can't read video." : "Что за мусор? Я не могу прочитать это.") + `\n${typeof source === 'object' ? source.url : source}`);
		if(err.message !== "Cannot read video")
			bot.emit('system_error', err, message);
	}
};
