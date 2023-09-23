import discord from 'discord.js';
import { __song__ } from '../instruction/playlist';
import { insert } from './sql';
import { sqlCall } from './utils';

export async function profiles(user: discord.User | discord.GuildMember | string): Promise<void> {
	if (typeof user != 'object' || !(user instanceof discord.User ? user.bot : user.user.bot))
		await sqlCall(
			`INSERT INTO profiles(id, level, xp, reputation, money, about, messages) VALUES('${
				typeof user === 'string' ? user : user.id
			}', 1, 0, 0, 100, "Анонимный юзер", 1)`
		);
}

export async function guilds_info(guild: discord.Guild | string): Promise<void> {
	await sqlCall(
		`INSERT INTO guilds_info(id, prefix, language, messages, volume, premium) VALUES('${
			typeof guild === 'string' ? guild : guild.id
		}', '?' , '${
			String(typeof guild === 'string' ? 'en' : guild.region).toLowerCase() === 'russia' ? 'ru' : 'en'
		}', 0, 0.6, 0)`
	);
}

export async function waifu(owner: discord.User | string, waifu: discord.User | string): Promise<void> {
	await sqlCall(
		`INSERT INTO waifu(id, waifu_id) VALUES('${typeof owner === 'string' ? owner : owner.id}', '${
			typeof waifu === 'string' ? waifu : waifu.id
		}')`
	);
}

export async function blockusers(id: string | discord.User, reason: string = 'Не указана'): Promise<void> {
	await sqlCall(`INSERT INTO blockusers(id, reason) VALUES('${typeof id === 'string' ? id : id.id}', '${reason}')`);
}

export async function guild_options(guild: discord.Guild | string): Promise<void> {
	await sqlCall(
		`INSERT INTO guild_options(id, ignoreNsfw, moderationChannel, logChannel, starboardChannel, starSize) VALUES('${
			typeof guild === 'string' ? guild : guild.id
		}', '', '', '', '', 3)`
	);
}

export async function memberslevel(id: string | discord.User, guild_id: string | discord.Guild): Promise<void> {
	await sqlCall(
		`INSERT INTO memberslevel(id, guild_id, level, xp) VALUES('${typeof id === 'string' ? id : id.id}', '${
			typeof guild_id === 'string' ? guild_id : guild_id.id
		}', 1, 0)`
	);
}

export async function respect(author: discord.User | string, target: discord.User | string): Promise<void> {
	await sqlCall(
		`INSERT INTO respect(author_id, target_id) VALUES('${typeof author === 'string' ? author : author.id}', '${
			typeof target === 'string' ? target : target.id
		}')`
	);
}

export async function ignoreChannels(channel: discord.Channel | string): Promise<void> {
	await sqlCall(`INSERT INTO ignoreChannels(id) VALUES('${typeof channel === 'string' ? channel : channel.id}')`);
}

export async function clan(author: string | discord.User, name: string): Promise<void> {
	if (author instanceof discord.User) {
		author = author.id;
		type author = string;
	}
	//@ts-ignore
	let count: number = (await sqlCall(`SELECT COUNT(1) FROM clan`))[0]['COUNT(1)'];
	await sqlCall(`INSERT INTO clan(id, name) VALUES(${count + 1}, '${name}')`);
}

export async function clanUser(id: number, user: string | discord.User): Promise<void> {
	if (user instanceof discord.User) {
		user = user.id;
		type user = string;
	}
	await insert('clanUser', { id, user });
}

export async function playlist(
	id: number | string,
	name: string,
	author: string | discord.User,
	songs: string | __song__[]
): Promise<void> {
	if (typeof id === 'string') {
		id = +id;
		type id = number;
	}
	if (typeof songs !== 'string') {
		songs = songs.toString();
		type songs = string;
	}
	if (typeof author !== 'string') {
		author = author.id;
		type author = string;
	}

	await insert('playlist', { id, name, author, songs });
}

export async function osu(
	id: { id: discord.User | string; username: string; mode?: number },
	mode: number = 0
): Promise<void> {
	let username = id.username;
	if (id.id instanceof discord.User) {
		if (id.mode !== undefined) mode = id.mode;
		//@ts-ignore
		id = id.id.id;
		type id = string;
	}
	await insert('osu', { id, username, mode });
}

export async function miners(user_id: discord.User | string, data: string | object): Promise<void> {
	if (typeof user_id === 'object') {
		type user_id = string;
		user_id = user_id.id;
	}
	if (typeof data !== 'string') {
		data = data ? JSON.stringify(data, undefined, 0) : '';
	}
	await insert('miners', { user_id, data });
}

export async function mute(
	user_id: discord.User | string,
	guild_id: discord.Guild | string,
	time: Date | number,
	roles: discord.Collection<discord.Snowflake, discord.Role> | Array<unknown> | string
): Promise<void> {
	if (typeof user_id !== 'string') {
		type user_id = string;
		user_id = user_id.id;
	}
	if (typeof guild_id !== 'string') {
		type guild_id = string;
		guild_id = guild_id.id;
	}
	if (typeof time != 'number') {
		type time = number;
		time = time.getTime();
	}
	if (typeof roles != 'string') {
		type roles = string;
		if (roles instanceof discord.Collection) roles = roles.map(r => r.id).join(';');
		else roles = roles.join(';');
	}
	await insert('mute', { user_id, guild_id, time, roles });
}

export async function join_leave(
	guild_id: string,
	join_txt: string = '',
	leave_txt: string = '',
	jimg: string = '',
	limg: string = '',
	jroles: string = ''
): Promise<void> {
	await insert('join_leave', {id: guild_id, join_txt, leave_txt, jimg, limg});
}

export default exports;
