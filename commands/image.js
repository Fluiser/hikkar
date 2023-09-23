const { MessageEmbed } = require('discord.js');
const { instruction } = process.scr;

module.exports.help = {
	name: ['anime', 'anim', 'аниме', 'изображение', 'image', 'images', 'img', 'имг'],
	usage: {
		en: 'image *<tag>',
		ru: 'имг *<тэг>'
	},
	tags: Object.keys(instruction.images.images),
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'fun'
};

module.exports.help.description = {
	ru: `Отправляет изображение определенного тэга.\nЕсли тэг не выбран, или выбрано несколько - будет отправлен случайный.\nДоступные тэги(Тэги следуют через пробел): [${module.exports.help.tags
		.map(t => `\`${t}\``)
		.join(', ')}]`,
	en: `Send images of defined tag.\nIf tag is not defined or tags defined more 1 - be a tag selected random.\nAvailable tags(Tags split space): [${module.exports.help.tags
		.map(t => `\`${t}\``)
		.join(', ')}]`
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let tag = args.length
		? args.map(arg => arg.toLowerCase()).filter(arg => module.exports.help.tags.includes(arg))
		: module.exports.help.tags;
	let selectedTag;

	if (!tag.length) tag = module.exports.help.tags;
	tag = await instruction.images.images[(selectedTag = tag.random())]();

	let embed = new MessageEmbed().setAuthor(selectedTag);

	if (tag) embed.setImage(tag);
	else embed.setDescription('Error. :c').setColor('#FF0000');

	await message.channel.send(embed);
};
