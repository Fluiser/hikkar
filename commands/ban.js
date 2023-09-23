const { embeds, utils } = process.scr;
const { sort } = process;

module.exports.help = {
	name: ['ban', 'бан'],
	usage: {
		en: 'ban <user> *<reason>',
		ru: 'бан <юзер> *<причина>'
	},
	description: {
		en: 'Banning defined user.',
		ru: 'Банит указанного юзера'
	},
	permissions: ['BAN_MEMBERS'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
	owner: false,
	tag: 'moderation'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let member = message.guild.member(args[0]) || message.mentions.members.first();
	let reason = args.slice(1).join(' ');
	if (!member || member.id === message.author.id) {
		if(!args[0]){
			await message.channel.send(
				embeds.error(message, language === 'en' ? 'User is not defined.' : 'пользователь не указан.')
			);
			return;
		}
	}

	if(member){
		const moderationRole = message.member.roles.cache.sort((a, b) => b.position - a.position).first(),
			userRole = member.roles.cache.sort((a, b) => b.position - a.position).first(),
			botRole = message.guild.members.cache.get(bot.user.id);

		if (moderationRole.position < userRole.position) {
			await message.channel.send(
				embeds.error(
					message,
					`${language === 'en' ? 'Permission denied' : 'Недостаточно прав'}.\n\`${moderationRole.name}\`[${
						moderationRole.position
					}] < \`${userRole.name}\`[${userRole.position}]`
				)
			);
			return;
		}
		if (botRole.position < userRole.position) {
			await message.channel.send(
				language === 'en' ? "I can't ban this user." : 'Я не могу забанить этого пользователя.'
			);
			return;
		}
	}

	if (reason.length > 200) reason = reason.slice(0, 200) + '...';

	try {
		if(member)
			await member.ban({ reason: `(${message.author.id})\nReason: ${reason}`, days: 3});
		else
		{
			if(!args[0].match(/\d{17,19}/g))
				return await message.channel.send(
					embeds.error(message, language === 'en' ? 'User is not defined.' : 'Пользователь не указан.')
				);

			try{
				await message.guild.members.ban(args[0]);
			} catch {
				return await message.channel.send("Bruh...");
			}
		}
		bot.emit('moderation', {
			type: 'ban',
			moderator: message.member,
			user: member,
			guild: message.guild,
			reason,
			data: {
				time
			}
		});
	} catch {}
};
