{
	const ___old_manager = require(process.mainModule.path + '/node_modules/discord.js/src/managers/BaseManager.js');
	//@ts-ignore
	require.cache[
		require.resolve(process.mainModule.path + '/node_modules/discord.js/src/managers/BaseManager.js')
	].exports = class extends ___old_manager {
		constructor() {
			super(...arguments);
		}
		get() {
			return super.cache.get(...arguments);
		}
		sort() {
			return super.cache.sort(...arguments);
		}
		filter() {
			return super.cache.filter(...arguments);
		}
		find() {
			return super.cache.find(...arguments);
		}
	};
}

const Discord = require('discord.js');
const fs = require('fs');
const embeds = require('../embeds.js');
const sql = require('../../dist/script/sql.js');
const utils = require('../../dist/script/utils.js');

class ExtAPIMessage extends Discord.APIMessage {
	constructor(...args) { super(...args); }

	resolveData() {
		if (this.data) return this;
		super.resolveData();
		const allowedMentions = this.options.allowedMentions || this.target.client.options.allowedMentions || {};

		if (allowedMentions.repliedUser !== undefined) {
			if (this.data.allowed_mentions === undefined) this.data.allowed_mentions = {};
			Object.assign(this.data.allowed_mentions, { replied_user: allowedMentions.repliedUser });
		}

		if (this.options.replyTo !== undefined) {
			Object.assign(this.data, { message_reference: { message_id: this.options.replyTo.id } });
		}
		return this;
	}
}

Discord.Structures.extend(
	'Message',
	s =>
		class extends s {
			inlineReply(content, options = {}) {
				if (!options.allowMentions || options.allowedMentions['repliedUser'] === undefined)
					(options.allowedMentions || (options.allowedMentions = {}))['repliedUser'] = false;
				if (content instanceof Discord.MessageEmbed) {
					options['embed'] = content;
					content = null;
				}
				return this.channel.send(ExtAPIMessage.create(this, content, options, { replyTo: this }).resolveData());
			}

			edit(content, options) {
				return super.edit(ExtAPIMessage.create(this, content, options).resolveData());
			}
		}
);

{
	const classAction = require(require.main.path + '/node_modules/discord.js/src/client/actions/MessageCreate.js');
	const oldhandle = classAction.prototype.handle;
	classAction.prototype.handle = function(data) {
		const channel = this.client.channels.cache.get(data.channel_id);
		if(channel) {
			if(!channel.messages) {
				//Если эта хуйня нужна будет.
				//channel.messages = new Discord.MessageManager(channel);
				//return oldhandle.bind(this)(data);
				return {};
			} else return oldhandle.bind(this)(data);
		}
	}
}
{
	const classAction = require(require.main.path + '/node_modules/discord.js/src/client/actions/MessageUpdate.js');
	const oldhandle = classAction.prototype.handle;
	classAction.prototype.handle = function(data) {
		const channel = this.getChannel(data);
		if(channel && channel.messages) {
			return oldhandle.bind(this)(data);
		} else return {old: null, updated: null};
	} 
}
{
	const classAction = require(require.main.path + '/node_modules/discord.js/src/client/actions/MessageDelete.js');
	const oldhandle = classAction.prototype.handle;
	classAction.prototype.handle = function(data) {
		const channel = this.getChannel(data);
		if(channel && channel.messages) {
			return oldhandle.bind(this)(data);
		}
	} 
}
{
	const classAction = require(require.main.path + '/node_modules/discord.js/src/client/actions/MessageDeleteBulk.js');
	const oldhandle = classAction.prototype.handle;
	classAction.prototype.handle = function(data) {
		const channel = this.getChannel(data);
		if(channel && channel.messages) {
			return oldhandle.bind(this)(data);
		}
	} 
}

{ //ctx
	Discord.Structures.extend(
		'GuildMember',
		s =>
		class extends s {
			/**
			 * @param {Date|String} time - либо дата в строке в формате ISO8601, либо объект класса Date, который будет конвертирован.
			 * @returns {Promise<GuildMember>}
			 */
			mute(time = null, reason) {
				if(typeof time !== 'string' && time !== null) {
					time = time.toISOString();
				}
				return this.edit({
					communication_disabled_until: time
				}, reason);
			}
		}
	);
} //end ctx

Discord.Structures.extend(
	'TextChannel',
	s =>
		class TextChannel extends s {
			constructor() {
				super(...arguments);
			}

			botPermission() {
				return this.permissionsFor(this.guild.members.cache.get(this.client.user.id));
			}

			hasBotPermission(perms) {
				const p = this.botPermission();
				return typeof perms === 'string' ? p.has(perms) : !perms.some(_p => !p.has(_p));
			}
		}
);

{
	const classOfShit = require(require.main.path + '/node_modules/discord.js/src/util/Permissions.js');
	const oldfunc = classOfShit.prototype.has;
	classOfShit.prototype.has = function has(perm, adm = true) {
		if(typeof perm === 'string')
			perm = classOfShit.FLAGS[perm];
		return oldfunc.bind(this)(perm, adm);
	} 
}

Discord.Structures.extend(
	'Message',
	MessageClass =>
		class extends MessageClass {
			constructor(client, data, channel) {
				super(client, data, channel);
			}
		}
);

Discord.Structures.extend(
	'Guild',
	GuildClass =>
		class Guild extends GuildClass {
			constructor() {
				super(...arguments);
			}

			/**
			 * @param {Discord.Message} msg
			 * @returns {Number} Возвращает кол-во звёздочек.
			 */
			getStars(msg) {
				return msg.reactions.cache.has('⭐') ? msg.reactions.cache.get('⭐').count : 0;
			}

			/**
			 * Вовзращает сообщения из звёздной доски, принимая в аргумент сообщения,
			 * которое туда попало.
			 * @param {Discord.Message} msg
			 * @returns {Discord.Message} 
			 */
			async getStarMessage(msg) {
				const data_msg = await sql.get('starboard', { message_id: msg.id });
				if (!data_msg) return null;
				try {
					const star_msg = await this.starboardChannel.messages.fetch(data_msg.star_id);
					return star_msg;
				} catch {
					await sql.remove('starboard', { message_id: msg.id });
				}
				return null;
			}

			/**
			 * Контент, который будет отображён для сообщения в звёздной доске.
			 * @param {Discord.Message} msg
			 * @returns {[String, Discord.Embed]}
			 */
			starMessageContent(msg) {
				return [`⭐${this.getStars(msg)} | ${msg.channel}`, embeds.starMessage(msg)];
			}

			/**
			 * Принимает в аргументы сообщение, которое входит в кандидаты на звёздную доску.
			 * Возвращает сообщение, которое было должно быть отправлено в звёздную доску.
			 * @param {Discord.Message} msg
			 * @returns {Discord.Message}
			 */
			async addStarMessage(msg) {
				if (!this.starboardChannel || !this.starboardChannel.hasBotPermission(['SEND_MESSAGES', 'EMBED_LINKS']))
					return void 0;
				const message = await this.starboardChannel.send(...this.starMessageContent(msg));
				await sql.insert('starboard', { message_id: msg.id, star_id: message.id });
				return message;
			}
			/**
			 * Делает обратное @addStarMessage - удаляет сообщение и убирает его из бд.
			 * @param {Discord.Message} msg
			 * @returns {void}
			 */
			async removeStarMessage(msg) {
				try{
					await this.starboardChannel.messages.delete(
						await sql.get('starboard', {message_id: typeof msg === 'object' ? msg.id : msg}).star_id
						);
				} catch {}
				await sql.remove('starboard', {
					message_id: typeof msg === 'object' ? msg.id : msg
				});
			}

			/**
			 * Основной метод, вызываемый при изменении кол-во звёзд у сообщения. Обрабатывает их
			 * кол-во, и, в зависимости от числа, производит дальнейшие действия.
			 * @param {Discord.Message} msg
			 * @returns {void}
			 */
			async star(msg) {
				if (!this.starboardChannel) {
					await this.updateData();
					if (!this.starboardChannel) return;
				}
				const size = this.getStars(msg);
				if (size >= this.starSize) {
					let star_msg = await this.getStarMessage(msg);
					if (!star_msg) star_msg = await this.addStarMessage(msg);
					else await star_msg.edit(...this.starMessageContent(msg));
				} else await this.removeStarMessage(msg);
			}

			/** Обновляет данные с бд.
			*	Загружает starboardChannel: string -> starboard {Discord.TextChannel(должен быть), starSize}
			*/
			async updateData() {
				const cfg = await sql.get('guild_options', { id: this.id });
				if(!cfg) return;
				this.starSize = cfg.starSize;
				if (!cfg.starboardChannel) return;
				const channel = await this.client.channels.fetch(cfg.starboardChannel);
				if (!channel) {
					await sql.update('guild_options', { starboardChannel: '' }, { id: this.id });
					this.starboardChannel = null;
					return;
				}
				this.starboardChannel = channel;
			}

			/**
			 * @param {Discord.PermissionResolvable} perm
			 * @returns {Boolean}
			 */
			botHasPermission(perm) {
				return this.members.cache.get(this.client.user.id).hasPermission(perm);
			}
		}
);

if (process.flags && process.flags.customCollection) {
	let CollectionSet = Collection.prototype.set;
	Collection.prototype.set = function (key, value) {
		CollectionSet.bind(this)(key, { value, lastUsage: Date.now() });
		return this;
	};

	let CollectionGet = Collection.prototype.get;
	Collection.prototype.get = function (key) {
		let v = CollectionGet.bind(this)(key);
		if (v) v.lastUsage = Date.now();
		return v && v.value;
	};

	/**
	 * @param {(ValueType, lastUsage: Number, key)} fn
	 * @param {Number} fn
	 * @param {Unknown} thisArg
	 * @returns {Void} Принимает либо callback, либо кол-во мс. Если оно привысит это число, то удаляет его.
	 */
	Collection.prototype['garbage'] = function (fn, thisArg) {
		if (typeof fn === 'function' && thisArg !== 'undefined') fn = fn.bind(thisArg);
		const time = Date.now();
		if (typeof fn === 'function') {
			for (const [key, value] of this) if (fn(value.value, value.lastUsage, key)) this.delete(key);
		} else {
			for (let [k, v] of this) if (fn <= time - v.lastUsage) this.delete(k);
		}
	};
}

/** @returns {T} */
Array.prototype.random = function () {
	return this[Math.floor(Math.random() * this.length)];
};

/**
 * @param {(T, Number) => boolean}
 * @returns {{
 * 	index: Number;
 * 	element: T;
 * }}
 */
Array.prototype['__find'] = function (f, thisArg) {
	if (thisArg !== undefined) f = f.bind(thisArg);
	for (let i = 0; i < this.length; ++i) {
		if (f(this[i], i))
			return {
				index: i,
				element: this[i]
			};
	}
};

/** @returns {Object} */
Object.dublicate = function () {
	const index = {};
	for (let key of Object.keys(this)) {
		if (typeof this[key] === 'object' && !Array.isArray(this[key])) index[key] = Object.dublicate(this[key]);
		else index[key] = this[key];
	}
	return index;
};

require.extensions['.png'] = function (_module, filename) {
	return (_module.exports = fs.readFileSync(filename));
};

Set.prototype['shift'] = function () {
	let index = this.values().next().value;
	this.delete(index);
	return index;
};

Set.prototype['pop'] = function () {
	let index;
	for (let value of this.values()) index = value;
	this.delete(index);
	return index;
};

Object.prototype.toString = function () {
	try {
		return JSON.stringify(this, undefined, ' ');
	} catch {
		return '[Object parsing error]';
	}
};

Array.prototype['last'] = function () {
	return this[this.length - 1];
};
//
// Discord.js@v12 suck.
// Error gateway 500
//
Array.prototype.toString = function () {
	return JSON.stringify(this);
};

Discord.MessageEmbed.prototype.toJSON = function () {
	if (!this.color) this.setColor(utils.randomRGB());
	return {
		title: this.title,
		type: 'rich',
		description: this.description,
		url: this.url,
		timestamp: this.timestamp ? new Date(this.timestamp) : null,
		color: this.color,
		fields: this.fields,
		thumbnail: this.thumbnail,
		image: this.image,
		author: this.author
			? {
					name: this.author.name,
					url: this.author.url,
					icon_url: this.author.iconURL
			  }
			: null,
		footer: this.footer
			? {
					text: this.footer.text,
					icon_url: this.footer.iconURL
			  }
			: null
	};
};

Number.prototype['format'] = function () {
	return String(this).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
};

String.prototype['list'] = function (limit = -1, sep = ' ') {
	if (limit <= 0) return null;
	if (!sep) return null;

	let index = [];
	const values = this.split(sep);
	if (Math.max(...values.map(v => v.length)) > limit) throw new RangeError('Cant press all values to small limit');

	for (let $ = 0, it = 0; it < values.length; ++it) {
		if (!index[$]) {
			index[$] = values[it];
			continue;
		}
		if (index[$].length + sep.length + values[it].length > limit) {
			++$;
			index[$] = values[it];
		} else {
			index[$] += `${sep}${values[it]}`;
		}
	}

	return index;
};

const ___casts__string = {
	array: function (str, pattern, sep = ';') {
		return str.replace(pattern, '$1').split(sep);
	},
	range(str) {
		let _f = str.match(/\d+/g);
		if (_f && _f.length === 2) {
			if ((_f = _f.map(n => +n)).some(Number.isNaN))
				//@ts-ignore
				return [0, 1];
			//@ts-ignore
			else return _f;
		}
		return [0, 1];
	}
};

const ___regexp__util__ = {
	array: [/(?:\[|{)([^]+)(?:}|\])/gim],
	parser: require('../../build/Release/parse.node')
};

const ___functions__parse___string = {
	randomInt: function (str) {
		let [min, max] = ___casts__string.range(str);

		if (Number.isNaN(+min)) min = 0;
		if (Number.isNaN(+max)) max = 10;

		return Math.floor(Math.random() * (max - min) + +min);
	},
	random(str) {
		let result;
		// @ts-ignore
		result = str.replace(___regexp__util__.array[0], '$1').split(';')['random']();
		return result;
	},
	notFound() {
		return `NotFound`;
	},
	tolowercase(str) {
		return str.toLowerCase();
	},
	date(str) {
		str = str.replace(/\s/g, '');
		let [time, lang] = ___casts__string.array(str, ___regexp__util__.array[0]);
		let __time__;

		if (!time) time = 'now';

		switch (time.toLowerCase()) {
			case 'now':
				__time__ = new Date();
				break;
			default:
				__time__ = Number.isNaN(+time) ? Date.now() : +time;
				if (__time__ < 0) __time__ = 0;
				break;
		}

		if (!['en', 'ru'].includes(lang)) lang = 'en';

		return utils.timeFormat(__time__, lang);
	}
};

function getTokens(str) {
	let index;
	let parsedValues = null;
	index = [Object.assign(___regexp__util__.parser.getTokens(str), { input: str })];
	const { value } = index[0];
	if (!value) return null;
	if ((parsedValues = ___regexp__util__.parser.parse(value)).length)
		//@ts-ignore
		index = index.concat(
			parsedValues
				.map(getTokens)
				.flat(1)
				.filter(v => v)
		);
	//@ts-ignore
	return index;
}
//TODO: Test syntax lexer
String.prototype.parseFunction = function (_func_ = ___functions__parse___string) {
	const normalizedString = this.toString();

	let parsedFunction = ___regexp__util__.parser.parse(normalizedString);
	if (!parsedFunction) return normalizedString;
	let __tokens__ = parsedFunction.map(getTokens).filter(e => e);
	let result = normalizedString;
	//@ParsingInstructions
	for (let lexeme of __tokens__) {
		let main = lexeme.shift();
		for (let i = lexeme.length - 1; i >= 0; --i) {
			let token = lexeme[i];
			let prevToken = lexeme[i - 1] || main;
			prevToken.value = prevToken.value.replace(
				token.input,
				//@ts-ignore
				_func_[token.key] ? _func_[token.key](token.value) : `[${token.key} is not found]`
			);
		}
		result = result.replace(
			main.input,
			//@ts-ignore
			_func_[main.key] ? _func_[main.key](main.value) : `[${main.key} is not found]`
		);
	}

	return result;
};

String.prototype['format'] = function (...args) {
	let index = this;
	for (let value of args) index = index.replace(/\%v/, value);
	return index;
};

function ___static_find_value(string, obj, blockFunction = false) {
	let value = obj;
	for (const k of typeof string === 'string' ? string.split('.') : string) {
		//@ts-ignore
		if (![undefined, null, NaN].includes(value)) {
			if (blockFunction && typeof value === 'function') {
				value = null;
				break;
			} else value = value[k];
		} else break;
	}
	/*
        return [null, undefined, NaN].includes(value) ? 'N/A' : value;
    */
	return value;
}
String.prototype['constructFormat'] = function (base, blockFunction = false) {
	const matches = this.match(/%[^%]+%/g);
	if (!matches) return this;
	let index = this;

	for (const str of matches) {
		//@ts-ignore
		index = index.replace(str, ___static_find_value(str.slice(1, str.length - 1), base, blockFunction));
	}

	return index;
};

Set.prototype['array'] = function () {
	const iterator = this.values();
	return Array.from({ length: this.size }, () => iterator.next().value);
};

Set.prototype.toString = function () {
	return this.array().toString();
};

Math['factorial'] = function (n) {
	if (n <= 1) return 1;

	let int = 1;
	for (; n > 1; --n) int *= n;
	return int;
};

String['range'] = function (start, stop) {
	let result = [];
	for (let i = start.charCodeAt(0), end = stop.charCodeAt(0); i <= end; ++i) {
		result.push(String.fromCharCode(i));
	}
	return result;
};

Object['equalKeys'] = function (lvalue, rvalue) {
	const lkeys = Object.keys(lvalue),
		rkeys = Object.keys(rvalue);
	if (lkeys.length !== rkeys.length) return false;
	for (const lkey of lkeys) if (!rkeys.includes(lkey)) return false;
	for (const rkey of rkeys) if (!lkeys.includes(rkey)) return false;
	return true;
};

Object['equalKeysRecursive'] = function (lvalue, rvalue) {
	const lkeys = Object.keys(lvalue),
		rkeys = Object.keys(rvalue);
	if (lkeys.length !== rkeys.length) return false;
	for (const lkey of lkeys) if (!rkeys.includes(lkey)) return false;
	for (const rkey of rkeys) if (!lkeys.includes(rkey)) return false;
	for (const key of lkeys) {
		if (typeof lvalue[key] === 'object') {
			if (typeof rvalue[key] === 'object')
				if (!Object['equalKeyRecursive'](lvalue[key], rvalue[key])) return false;
				else return false;
		}
	}
	return true;
};

try {
	const sub = require('../../build/Release/proto.node');
	Number['cint32'] = sub.cint32;
	Number['cuint32'] = sub.cuint32;
	Number['cint64'] = sub.cint64;
	Number['cuint64'] = sub.cuint64;
	Number['ucharToInt32'] = sub.ucharToInt32;
	Number['charToInt32'] = sub.charToInt32;
	Buffer['buffer_from_string_memcpy'] = sub.buffer_from_string_memcpy;

	Number.prototype['compress'] = function () {
		return sub.compressNumber(this);
	};

	String.prototype['extract'] = function () {
		return sub.extractNumber(this);
	};
} catch {}
