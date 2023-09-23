const { locales } = process.json;
const embeds = process.scr.embeds;
const { parseDuration } = process.scr.utils;
const mute = process.scr.instruction.mute;
const { sql } = process.scr;
const ms = require('ms');

const minTime = ms('1m');
const maxTime = ms('90d');

module.exports.help = {
	name: ['mute', 'мут', 'заглушить'],
	usage: {
		en: 'mute @user <time=12h> <Reason>',
		ru: 'мут @пользователь <время=12ч> <Причина>'
	},
	description: {
		en: 'Shut up, dude!\nTakes away permission send messages.',
		ru: 'Заткнись, чувак!\nЗабирает возможность писать сообщения.'
	},
	permissions: ['SEND_MESSAGES', 'MANAGE_ROLES', 'MANAGE_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'MANAGE_ROLES', 'MANAGE_CHANNELS'],
	owner: false,
	tag: 'moderation'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	const argsMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

	if (!argsMember) {
		await message.channel.send(
			embeds.error(message, language === 'en' ? 'User is not defined.' : 'Юзер не указан.')
		);
		return;
	}

    const botRole = message.guild.members.cache
        .get(bot.user.id)
        .roles.cache.sort((a, b) => b.position - a.position)
        .first();
    const argsUR = message.member.roles.cache.sort((a, b) => b.position - a.position).first();
	const authorRole = message.member.roles.cache.sort((a, b) => b.position - a.position).first();

	if (argsUR && botRole.position < argsUR.position) {
		await message.channel.send(
			embeds.error(
				message,
				locales.templates.missingBotPermission[language] // botRole < SukaRole
			)
		);
		return;
	}

	if (authorRole.position < argsUR.position) {
		await message.channel.send(embeds.error(message, locales.templates.missingPermissions[language])); //author role < pidor Role
		return;
	}

	const time = parseDuration(args[1]);
	let { muteRole } = sql.get('guild_options', { id: message.guild.id }, message.guild);

	if (muteRole) muteRole = message.guild.roles.cache.get(muteRole);

	if (!muteRole) {
		muteRole = await message.guild.roles.create({
			data: {
				name: 'Mute-Hikka_r',
				color: '#000000',
				permissions: []
			}
		});
		for (const [, channel] of message.guild.channels.cache) {
			switch(channel.type)
			{
				case 'text':
					await channel.updateOverwrite(muteRole.id, {
						ADD_REACTIONS: false,
						SEND_MESSAGES: false
					}); break;
				case 'voice':
					await channel.updateOverwrite(muteRole.id, {
						CONNECT: false,
						SPEAK: false
					}); break;
				default: continue;
			}
		}
		await sql.update('guild_options', { muteRole: muteRole.id }, { id: message.guild.id });
	}

	if (time < minTime || time > maxTime) {
		await message.channel.send(embeds.error(message, locales.commands.mute.missRangeTime[language].format('90')));
		return;
	}
	//(user_id, guild_id, roles, time)

	const reason = args.slice(2).join(' ').slice(0, 1024);
	try {
		await argsMember.roles.remove(
			argsMember.roles.cache,
			`Mute. Mod: ${message.author.tag} | Reason: ${reason.slice(256)}`
		);
		await argsMember.roles.add(muteRole);
		await mute.add(
			argsMember.id,
			message.guild.id,
			argsMember.roles.cache.map(role => role.id),
			time
		);
		bot.emit('mute', {
			type: 'w',
			moderator: message.member,
			user: argsMember,
			guild: message.guild,
			reason,
			data: {
				time
			}
		});
	} catch (err) {
		bot.emit('system_error', err);
		/* none */
	}
};
