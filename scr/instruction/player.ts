import { StreamDispatcher, User, VoiceChannel, VoiceConnection } from 'discord.js';
import { EventEmitter } from 'events';
import http from 'http';
import https from 'https';
import { Readable } from 'stream';
import ytdl from 'ytdl-core';
import { get, update } from '../script/sql';
import ytStream from '../script/ytStream';

/*
 * callback(
 *  Buffer toWrite,
 *  Buffer readFrom,
 *  size_t startRead - for readFrom buffer
 *  size_t startWrite - for toWrite Buffer
 *  size_t endRead - for endPTR reading iterator.
 * )
 * */

const bufferSwap: (toWrite: Buffer, readFrom: Buffer, startRead: Number, startWrite: Number, endRead: Number) => void =
	require('../../build/Release/proto.node').sbWrite;

//@ts-ignore
const { locales } = process.json;

class source {
	private cache: Buffer;
	// private __cache__index: number;
	public readonly author: string;
	public readonly source: string;
	public skip?: string[];
	private __stream__: Readable;

	public constructor(author: User | string, source: string) {
		this.author = typeof author === 'string' ? author : author.id;
		this.source = source;
	}

	public async read(): Promise<Readable> {
		return new Promise(async resolve => {
			if(this.__stream__) {
				//@ts-ignore
				if(this.__stream__['_readableState'].ended) {
					if(this.cache) {
						this.__stream__ = new Readable();
						resolve(this.__stream__);
						this.__stream__.push(this.cache);
						this.__stream__.push(null);
						return;
					} else {
						resolve(await this.load());
						return; 
					}
				} else {
					resolve(this.__stream__);
					return;
				}
			} else {
				if(this.cache) {
					this.__stream__ = new Readable();
					resolve(this.__stream__);
					this.__stream__.push(this.cache);
					this.__stream__.push(null);
					return;
				} else {
					resolve(await this.load());
					return;
				}
			}
		});
	}

	private async load(): Promise<Readable> {
		return new Promise(async resolve => {
			if (ytdl.validateURL(this.source)) {
				try{
					this.__stream__ = await new ytStream(this.source).read();
				} catch {
					resolve(null);
				}
				resolve(this.__stream__);
			} else
				(this.source.startsWith('https') ? https : http).get(this.source, res => {
					this.__stream__ = res;
					resolve(this.__stream__);
					// res.on('data', d => {
					//     if(!this.cache) {
					//         this.cache = Buffer.alloc(8388608/*8mb*/);
					//         bufferSwap(this.cache, d, 0, 0, d.length);
					//         this.__cache__index = d.length;
					//     } else  {
					//         bufferSwap(this.cache, d, 0, this.__cache__index, d.length);
					//         this.__cache__index += d.length; // Pleas, d must be Buffer.
					//     }
					// }).on('end', () => {
					//     resolve(void 0);
					// });
				});
		});
	}
}

class Manager extends EventEmitter {
	public readonly channel: VoiceChannel;
	public readonly connection: VoiceConnection;
	protected queue: source[];
	private stream: StreamDispatcher;
	private paused: boolean;
	public repeat: number;
	// Ибо не меняем. Пока и никогда.
	public readonly language: string;
	private _volume: number;

	public constructor(channel: VoiceConnection | VoiceChannel, language: string = 'en', queue: source[] = null) {
		super();

		this.language = language;
		if(channel instanceof VoiceChannel)			
			this.channel = channel;
		else {
			this.channel = channel.channel;
			this.connection = channel;
		}
		this.queue = queue ? queue : [];
		this.on('end', () => {
			//@ts-ignore
			this.queue = this.channel = this.language = null;
			if (this.stream) this.stream.end();
			if (this.connection) this.connection.disconnect();
			if (global.gc) global.gc();
		});
	}

	public async join(): Promise<VoiceConnection> {
		//@ts-ignore
		return (this.connection = await this.channel.join());
	}

	public async play(volume: number = null): Promise<void> {
		if (!this._volume) {
			if (volume) this._volume = volume;
			else {
				//@ts-ignore
				this._volume = (
					await get<{ volume: number }>('guilds_info', { id: this.channel.guild.id }, this.channel.guild)
				).volume;
			}
		}

		if (!this.connection) await this.join();

		if (this.queue.length) {
			const music = await this.queue[0].read();
			if(music === null) throw 'Cannot read video';
			(this.stream = this.connection.play(music, {
				highWaterMark: 3,
				volume: this._volume
			})).on('finish', () => {
				if (!this.queue) return;
				if (typeof this.repeat === 'undefined' || (this.repeat-- < 1)) this.queue.shift();
				if (this.queue.length) this.play();
				else {
					this.connection.disconnect();
					this.emit('end');
				}
			});
		} else if (this.connection) this.connection.disconnect();
	}

	public async push(User: string | User, url: string, cache: boolean = false): Promise<void> {
		let file: source;

		this.queue.push((file = new source(User, url)));
		// if (cache) await file.load();

		if (!this.stream) 
			try{
				await this.play();
			} catch (err) {
				throw err;
			}
	}

	public pause(): boolean {
		if (this.stream) {
			if (this.paused) this.stream.resume();
			else this.stream.pause();
			this.paused = !this.paused;
		}
		return this.stream ? this.paused : false;
	}

	public async stop() {
		this.emit('end');
	}

	public async volume(volume: number): Promise<void> {
		this._volume = volume / 100;
		await update('guilds_info', { volume: this._volume }, { id: this.channel.guild.id });
		if (this.stream) this.stream.setVolume(this._volume);
	}

	public async skip(msgAuthor: string | User): Promise<string> {
		let countSkip: number;
		let sizeUsers = this.channel.members.filter(member => !member.user.bot).size;
		if (typeof msgAuthor === 'object') {
			msgAuthor = msgAuthor.id;
		}
		type msgAuthor = string;
		return new Promise(resolve => {
			if (!this.channel || !this.stream) return resolve(locales.system.player.notStream[this.language]);
			if (this.queue[0].author === msgAuthor) {
				resolve(locales.system.player.skip[this.language]);
				this.repeat = undefined;
				this.stream.emit('finish');
			} else if (
				(countSkip = Math.floor(sizeUsers * 0.75)) >=
				(this.queue[0].skip
					? // TS SUCK MY DICK
					  //@ts-ignore
					  this.queue[0].skip.includes(msgAuthor)
						? this.queue[0].skip.length
						: //@ts-ignore
						  this.queue[0].skip.push(msgAuthor)
					: //@ts-ignore
					  (this.queue[0].skip = [msgAuthor]), 1)
			) {
				resolve(locales.system.player.skip[this.language]);
				this.repeat = undefined;
				this.stream.emit('finish');
			} else
				return resolve(locales.system.player.smallerSkip[this.language].format(this.queue[0].skip.length, countSkip));
		});
	}
}

export default exports = module.exports = { Manager, source };
