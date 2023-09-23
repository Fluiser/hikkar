const { sqlCall } = process.scr.utils;
const { MessageEmbed } = require('discord.js');
const { instruction, embeds, sqlPatterns } = process.scr;

module.exports.help = {
	name: ['porn', 'pron', 'порн', 'порно', 'прон', 'xxx'],
	usage: {
		en: 'xxx *<tag>',
		ru: 'порн *<тэг>'
	},
	tags: Object.keys(instruction.images.porn),
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'fun'
};

module.exports.help.description = {
	ru: `Отправляет порнографию определенного тэга.\nЕсли тэг не выбран, или выбрано несколько - будет отправлен случайный.\nДоступные тэги(Тэги следуют через пробел): [${module.exports.help.tags
		.map(t => `\`${t}\``)
		.join(', ')}]`,
	en: `Send porn of defined tag.\nIf tag is not defined or tags defined more 1 - be a tag selected random.\nAvailable tags(Tags split space): [${module.exports.help.tags
		.map(t => `\`${t}\``)
		.join(', ')}]`
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let [guild] = await sqlCall(
		`SELECT * FROM guild_options WHERE id = '${message.guild.id}'`,
		sqlPatterns.guild_options,
		message.guild
	);
	if (!guild.ignoreNsfw[0] && !message.channel.nsfw)
		return message.channel.send(
			embeds.error(
				message,
				language === 'en'
					? 'For this channel not available nsfw content'
					: 'Для этого канала отключён nsfw content'
			)
		);

	let tag = args.length
		? args.map(arg => arg.toLowerCase()).filter(arg => module.exports.help.tags.includes(arg))
		: module.exports.help.tags;
	let selectedTag;

	if (!tag.length) tag = module.exports.help.tags;
	tag = await instruction.images.porn[(selectedTag = tag.random())]();

	let embed = new MessageEmbed().setAuthor(selectedTag);

	if (tag) embed.setImage(tag);
	else embed.setDescription('Error. :c').setcolor('#FF0000');

	await message.channel.send(embed);
};
