import { exec } from 'child_process';
import {
	Collection,
	Guild,
	GuildMember,
	Message,
	MessageMentions,
	Role,
	TextChannel,
	User,
	VoiceChannel
} from 'discord.js';
import moment from 'moment';
import ms from 'ms';
import { Connection, createConnection, QueryError } from 'mysql2';
import { Locale, localize } from 'strftime';
import weather from 'weather-js';

var sleepSync: (ms: number) => void;
try {
	sleepSync = require('../../build/Release/sleep.node');
} catch {
	sleepSync = function (): void {
		console.log('sleepSync function is not compile.');
	};
}

interface spotifyTime {
	start: Date;
	end: Date;
}

interface userLevel {
	level: number;
	xp: number;
}

const locales: { [locale: string]: Locale } = {
	en_US: {
		days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		months: [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		],
		shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

		AM: 'AM',
		PM: 'PM',
		am: 'am',
		pm: 'pm',
		formats: {
			c: '%a %d %b %Y %X %Z',
			D: '%m/%d/%y',
			F: '%Y-%m-%d',
			R: '%H:%M',
			r: '%I:%M:%S %p',
			T: '%H:%M:%S',
			v: '%e-%b-%Y',
			X: '%r',
			x: '%D'
		}
	},
	ru_RU: {
		days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
		shortDays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
		months: [
			'Январь',
			'Февраль',
			'Март',
			'Апрель',
			'Май',
			'Июнь',
			'Июль',
			'Август',
			'Сентябрь',
			'Октябрь',
			'Ноябрь',
			'Декабрь'
		],
		shortMonths: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
		AM: 'AM',
		PM: 'PM',
		am: 'am',
		pm: 'pm',
		formats: {
			c: '%a %d %b %Y %X',
			D: '%d.%m.%y',
			F: '%Y-%m-%d',
			R: '%H:%M',
			r: '%I:%M:%S %p',
			T: '%H:%M:%S',
			v: '%e-%b-%Y',
			X: '%T',
			x: '%D'
		}
	}
};

const formatLocales: { [k: string]: string } = {
	ru: 'ru_RU',
	en: 'en_US'
};

const strftime: { [k: string]: ReturnType<typeof localize> } = {};
for (let locale of Object.keys(locales)) {
	strftime[locale] = localize(locales[locale]);
}

export function random(max: number, min: number = 0): Number {
	return Math.floor(Math.random() * (max - min) + min);
}

export function timeFormat(Date_: number | Date, format: string = 'en_US'): string {
	if (typeof Date_ === 'number') Date_ = new Date(Date_);
	if (!(Date_ instanceof Date)) return '';
	return (strftime[format] || strftime[formatLocales[format]])(
		`%B %d, %Y ${format === 'ru_RU' || format === 'ru' ? '' : ''}%H:%M:%S`,
		Date_
	);
}

export function spotifyTime(time: spotifyTime): string {
	let index: string = '';

	let allTime: number = time.end.getTime() - time.start.getTime();
	let allTime_sec: number = Math.floor((allTime % 60000) / 1000); /*min*/
	let allTime_min: number = Math.floor((allTime - allTime_sec * 1000) / 60000);

	let pastTime: number = Date.now() - time.start.getTime();
	let pastTime_sec: number = Math.floor((pastTime % 60000) / 1000); /*min*/
	let pastTime_min: number = Math.floor((pastTime - pastTime_sec * 1000) / 60000);

	function resize(time: string | number): string {
		if (String(time).length < 2) return `0${time}`;
		else return time.toString();
	}

	index += `${resize(pastTime_min)}:${resize(pastTime_sec)}/${resize(allTime_min)}:${resize(allTime_sec)}`;
	return index;
}

export async function baseSqlCall(sql: Connection, str: string): Promise<object[]> {
	return new Promise((resolve, reject) => {
		sql.query(str, (error: QueryError, result: object[]) => {
			if (error) reject(error);
			else resolve(Array.isArray(result) ? result : []);
		});
	});
}

export const sort = {
	role: function (r1: Role, r2: Role): number {
		if (r1.position > r2.position) return -1;
		if (r1.position < r2.position) return 1;
		return 0;
	}
};

export async function getDuration(fun: Function, callBack: Function = null, ...Args: any): Promise<number> {
	return new Promise(async resolve => {
		let start: [number, number] = process.hrtime();
		let result: any = fun(...Args);
		if (result instanceof Promise) result = await result;
		start = process.hrtime(start);
		let end: number = start[0] + start[1] / 1000000000;

		if (callBack) callBack(end, result);
		resolve(end);
	});
}

export function durationFormat(ms: number, language: string = 'en'): string {
	const path: object = {
		years: 'г.',
		months: 'мес.',
		days: 'дн.',
		hours: 'час.',
		minutes: 'мин.',
		seconds: 'сек.'
	};
	//@ts-ignore
	let _data: object = moment.duration(ms)['_data'];
	let index: string[] = [];
	for (let key of Object.keys(path)) {
		if (index.length >= 3) break;
		//@ts-ignore
		if (_data[key] > 0) index.push(language === 'en' ? `${_data[key]}${key} ` : `${_data[key]}${key === 'years' ? _data[key] > 4 ? 'лет': path[key] : path[key]} `);
	}
	//@ts-ignore
	if (!index.length) index.push(language === 'en' ? `${_data['milliseconds']}ms` : `${_data['milliseconds']}мс.`);
	return index.join('');
}

export function mathLevel(user: userLevel): userLevel {
	let nextLvl: number = 10 * user.level * Math.log(user.level + 1); //(user.level + 1) * 100 + (user.level+1)*25;
	if (user.xp > nextLvl) {
		++user.level;
		user.xp = user.xp - nextLvl;
	}
	return user;
}

export async function clearMsgs(channel: TextChannel, count: number, user: User | GuildMember): Promise<void> {
	if (!user) {
		let messages: Message[] = (await channel.messages.fetch({ limit: 100 })).array();
		let lastMessage: string;
		for (
			;
			count >= 1 && messages ? messages.length : true;
			messages = (
				await channel.messages.fetch(lastMessage ? { before: lastMessage, limit: 100 } : { limit: 100 })
			).array()
		) {
			try {
				if (Date.now() - messages[0].createdTimestamp >= 1209600000) break;
				if (count < messages.length) messages = messages.slice(0, count);
				count -= messages.length;
				if (!messages.length) break;
				lastMessage = messages[messages.length - 1].id;
				await channel.bulkDelete(messages, true);
			} catch (err) {
				//@ts-ignore
				process.emit('system', err);
				break;
			}
		}
	} else {
		let lastMsgs: number = channel.messages.cache.filter(msg => msg.author.id === user.id).size;
		let updMsgs: Function = () => channel.messages.cache.filter(m => m.author.id === user.id).size;
		let notLastUpd: number = 0;
		let lastMsg: string = null; // wtf, dude?
		// what the fucking unknown message, discord?
		let messages: Message[] | Collection<string, Message>;

		for (; count; ) {
			if (notLastUpd >= 3) break;
			messages = await channel.messages.fetch(lastMsg ? { limit: 100, before: lastMsg } : { limit: 100 });
			if (Date.now() - messages.first().createdTimestamp >= 1209600000) break;
			if (!messages.size) break;
			lastMsg = messages.last().id;

			messages = messages.filter(m => m.author.id === user.id);
			if (messages.size) notLastUpd = 0;
			else ++notLastUpd;
			if (count < messages.size) {
				messages = messages.first(count);
				count = 0;
			} else count -= messages.size;
			if (messages instanceof Array ? messages.length : messages.size) await channel.bulkDelete(messages, true);
		}
	}
}

export let sleep = (ms: number = 2000): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
export { sleepSync };

export async function getWeather(location: string, language = 'en'): Promise<object | void> {
	return new Promise(resolve => {
		weather.find({ search: location, degreeType: 'C', lang: language }, (error, result) => {
			if (error) return resolve(null);
			if (result.length) resolve(result[0]);
			else resolve(null);
		});
	});
}

export function reloadFile(path: string): any {
	path = require.resolve(path);
	delete require.cache[path];
	return require(path);
}

export async function exe(cmd: string): Promise<string> {
	return new Promise(resolve => {
		exec(cmd, (error, out) => {
			resolve(error || out !== 'null' ? out : null);
		});
	});
}

export async function sqlCall<T = object>(
	str: string,
	insertStr: string | Function = null,
	...insertArgs: any[]
): Promise<T[]> {
	//@ts-ignore
	let sql: Connection = process['sql'];
	//@ts-ignore
	if (sql.threadId == null && sql instanceof Connection) {
		for (let i = 0; i < 3 && sql.threadId == null; ++i) {
			if (!sql.config) await sleep(1000);
			sqlConnect(sql.config);
			await sleep(400);
		}
	}
	return new Promise(async (resolve, reject) => {
		let index: object[] = await baseSqlCall(sql, str);
		if (insertStr && !index.length) {
			await (typeof insertStr === 'string' ? baseSqlCall(sql, insertStr) : insertStr(...insertArgs));
			index = await sqlCall(str);
		}
		//@ts-ignore
		resolve(index.length ? index : []);
	});
}

export function parseDuration(str: string): number {
	if (!str) return 0;
	let r: number = 0;
	let replaces: string[];
	let replace = {
		с: 's',
		м: 'm',
		ч: 'h',
		д: 'd',
		н: 'w',
		г: 'y'
	};

	for (let key of Object.keys(replace)) {
		//@ts-ignore
		str = str.replace(new RegExp(key, 'gi'), replace[key]);
	}
	if ((replaces = str.match(/\d{1,}\w/gim)))
		for (let value of replaces) {
			let p: number;
			if ((p = ms(value))) r += p;
		}
	return r;
}

export function sqlConnect(cfg: object): void {
	let sql: Connection = createConnection(cfg);
	sql.connect((err: Error) => {
		if (err) throw err;
		else {
			console.log('Database: Connection established.');
			//@ts-ignore
			process['sql'] = sql;
			sql.query(`SELECT * FROM blockusers`, (error: Error, result) => {
				if (error) throw error;
				else {
					//@ts-ignore
					for (let user of result) process['blockedUsers'].add(result.id);
				}
			});
		}
	});
	sql.on('error', (err: any) => {
		console.log('Database: Connection dropped.', err);

		//@ts-ignore
		if (process['blockedUsers']) process['blockedUsers'].clear();
		sql.destroy();
		sqlConnect(cfg);
	});
}

export function parseType(str: string): any {
	switch (true) {
		case str === 'NaN':
			return NaN;
		case str.toLowerCase() === 'true' || str.toLowerCase() === 'false':
			return str.toLowerCase() === 'true' ? true : false;
		case str === 'undefined':
			return undefined;
		case str === 'null':
			return null;
		case !Number.isNaN(+str):
			return +str;
		default:
			return str;
	}
}

export function randomRGB(): number {
	return Math.floor(Math.random() * 0xffffff);
}

interface ___replaces {
	__id: string;
	[key: string]: unknown;
}

export const __replaces__: { [key: string]: (arg: object, language: string) => ___replaces } = {
	GuildMember: (user: GuildMember, language: string = 'en') => ({
		__id: 'member',
		toString: user.toString,
		username: user.user.username,
		nickname: user.nickname || 'N/A',
		displayName: user.nickname || user.user.username,
		tag: user.user.tag,
		discriminator: user.user.discriminator,
		avatarURL: user.user.avatarURL({ size: 4096, dynamic: true, format: 'png' }),
		lastMessage:
			(user.lastMessage && {
				toString() {
					return user.lastMessage;
				},
				id: user.lastMessage
			}) ||
			'MESSAGE_NOT_FOUND',
		joinedAt: timeFormat(user.joinedAt || 0, language),
		joinedDuration: durationFormat(Date.now() - user.joinedTimestamp || 0, language)
	}),
	Guild: (g: Guild, lang: string = 'en') => ({
		__id: 'guild',
		toString: g.toString,
		name: g.name,
		channels: {
			count: g.channels.cache.size,
			voice: {
				afk: g.afkChannel && {
					id: g.afkChannel.id,
					name: g.afkChannel.name
				},
				count: g.channels.cache.filter(c => c.type === 'voice').size
			},
			text: {
				count: g.channels.cache.filter(c => c.type === 'text').size,
				system: g.systemChannel && {
					id: g.systemChannelID,
					name: g.systemChannel.name,
					toString: g.systemChannel.toString
				}
			}
		},
		moderation: g.verificationLevel
	})
};

export function export_data_obj(env: Object[], lang:string = 'ru'): {[key: string]: {__id: string, [key: string]: unknown}} {
	const obj: {[key: string]: {__id: string, [key: string]: unknown}} = {};

	for(const item of env) {
		const prop_name = item.constructor && item.constructor.name;
		if(__replaces__[prop_name]) {
			const prop = __replaces__[prop_name](item, lang);
			obj[prop.__id] = prop;
		}
	}

	return obj
};

export function findChannel(
	ctx: Collection<string, TextChannel | VoiceChannel>,
	search: string
): TextChannel | VoiceChannel {
	search = search.toLowerCase();
	let channel = ctx.get(search);
	if (!channel) channel = ctx.get(search.replace(MessageMentions.CHANNELS_PATTERN, '$1'));
	// Господа и дамы, я хуй клал на ваш ебаный typescript.
	// У нормальных людей похуй на припизднутую семантику ts.
	//@ts-ignore
	if (!channel) channel = ctx.find(ch => ch.name.toLowerCase() === search || ch.name.includes(search));
	return channel;
}

export default module.exports;
