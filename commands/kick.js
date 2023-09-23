const { embeds } = process.scr;
const { locales } = process.json;

module.exports.help = {
	name: ['kick', 'кик', 'выгнать'],
	usage: {
		en: 'kick <user> *<reason>',
		ru: 'кик <юзер> *<причина>'
	},
	description: {
		en: 'Kick defined user.',
		ru: 'Выгоняет указанного юзера'
	},
	permissions: ['KICK_MEMBERS'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
	owner: false,
	tag: 'moderation'
};

const sort = (a, b) => b.position - a.position;

module.exports.run = async (bot, message, args, language = 'en') => {
	const member = message.guild.member(args[0]) || message.mentions.members.first();
	const authorRole = message.member.roles.cache.sort(sort).first(),
		memberRole = member && member.roles.cache.sort(sort).first(),
		botRole = message.guild.members.cache.get(bot.user.id).roles.cache.sort(sort).first();
	args.shift();
	let reason = args.slice(1).join(' ');

	if (!member || member.id === message.author.id) {
		await message.channel.send(
			embeds.error(message, language === 'en' ? 'User is not defined.' : 'Юзер не указан.')
		);
		return;
	}

	if (authorRole.position < memberRole.position) {
		await message.channel.send(
			embeds.error(
				message,
				`${language === 'en' ? 'Permission denied' : 'Недостаточно прав'}.\n\`${authorRole.name}\`[${
					authorRole.position
				}] < \`${memberRole.name}\`[${memberRole.position}]`
			)
		);
		return;
	}
	if (botRole.position < memberRole.position) {
		await message.channel.send(
			language === 'en' ? "I can't kick this user." : 'Я не могу выгнать этого пользователя.'
		);
		return;
	}

	if (reason.length > 200) reason = reason.slice(0, 200) + '...';

	try {
		await member.kick(`(${message.author.id})\n Reason: ${reason}`);
		bot.emit('moderation', {
			type: 'kick',
			moderator: message.member,
			user: member,
			guild: message.guild,
			reason
		});
	} catch {}
};
