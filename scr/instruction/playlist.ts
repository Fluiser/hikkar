import { User } from 'discord.js';
import { get, getAll } from '../script/sql';
import * as sqlPatterns from '../script/sqlPatterns';
import { sqlCall } from '../script/utils';
import { isPlaylist, youtube } from './ytApi';
// @ts-ignore
const __youtube__api__: youtube = process['ytApi'];
//@ts-ignore
const { system } = process.json;

export interface __playlist__ {
	id?: number;
	name: string;
	author: string;
	songs: __song__[];
}

export interface __raw__playlist {
	id: number;
	name: string;
	author: string;
	songs: string;
}

export interface __song__ {
	title?: string;
	duration?: number;
	url: string;
}

module.exports = {
	filter: /g.+?/g,
	needFilter: false,
	max: 5,
	filterName: function (str: string): string {
		return this.needFilter ? str : (str.match(this.filter) || []).join('');
	},
	convertSong(obj: __raw__playlist): __playlist__ {
		obj.songs = JSON.parse(obj.songs);
		//@ts-ignore
		return obj;
	},
	async handleSongs(___url___: string): Promise<__song__[]> {
		let playlistId: string = isPlaylist(___url___);
		if (playlistId) {
			let playlist = await __youtube__api__.getPlaylist(playlistId);
			return playlist.items.map(item => ({
				title: item.title,
				url:
					typeof item.id === 'string'
						? item.id.startsWith('https://')
							? item.id
							: 'https://youtube.com/watch?v=' + item.id
						: item.id.videoId.startsWith('https://')
						? item.id.videoId
						: 'https://youtube.com/watch?v=' + item.id.videoId
			}));
		}
		const d = await __youtube__api__.getInfo(___url___);
		return [
			Object.assign(
				{ url: d.videoDetails.video_url, title: d.videoDetails.title },
				{ duration: +d.videoDetails.lengthSeconds }
			)
		];
	},
	make: async function (
		author: User | string,
		title: string,
		language: string = 'en'
	): Promise<string | __playlist__> {
		if (typeof author !== 'string') {
			author = author.id;
			type author = string;
		}

		let { length } = await getAll('playlist', { author: author });
		if (length > this.max) return system.playlist.limitPlaylists[language].format(this.max);

		const __data = await sqlCall<{ id: string }>(`SELECT * FROM playlist ORDER BY id DESC LIMIT 1`);
		let id = __data.length ? +__data[0].id + 1 : 0;

		let request = {
			id,
			name: this.filterName(title),
			author,
			// @ts-ignore
			songs: []
		};
		await sqlPatterns.playlist(id, request.name, request.author, request.songs);
		return request;
	},
	//Main function for search
	get: async function (song: string | number): Promise<__playlist__> {
		if (typeof song === 'number' && Number.isNaN(song))
			throw new TypeError('Argument type must be Number or String');
		//@ts-ignore
		if (Number.isNaN(+song)) return this.find(song);
		//@ts-ignore
		else return get<__playlist__>('playlist', { id: song });
	},
	//Only find playlist on name
	find: async function (name: string): Promise<__playlist__[]> {
		let main = await sqlCall<__raw__playlist>(
			`SELECT * FROM playlist WHERE LOCATE('${name.replace(/\'/g, "\\'")}',name) LIMIT 5`
		);
		return main.map(this.convertSong);
	},
	//Get only id
	__get: async function (id: number | string): Promise<__playlist__> {
		if (typeof id === 'string') id = +id;
		//@ts-ignore
		let main = await get<__raw__playlist>('playlist', { id });
		if (!main) return null;
		else return this.convertSong(main);
	},
	async __raw_get(data: object = {}): Promise<__raw__playlist[]> {
		//@ts-ignore
		return getAll('playlist', data);
	},
	replace: async function (
		author: string | User,
		idPlaylist: number,
		position: number,
		language = 'en',
		element: string = null
	): Promise<string> {
		if (typeof author !== 'string') {
			author = author.id;
			type author = string;
		}
		let playlist = await this.__get(idPlaylist);
		if (!playlist || playlist.author !== author) return system.playlist.permissionDenied[language];
		let removedList: __song__[];
		if (element) removedList = playlist.songs.splice(position - 1, 1, { url: element });
		else removedList = playlist.songs.splice(position - 1, 1);
		return system.playlist.removeSongs[language].format(playlist.name, removedList);
	}
};
