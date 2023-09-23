import superagent from 'superagent';
import ytdl from 'ytdl-core';

export interface Duration {
	toString: () => string;
	seconds: number;
	timestamp: string;
}

export interface Author {
	name: string;
	id: string;
	url: string;
	userId: string;
	userName: string;
	userUrl: string;
	channelId: string;
	channelUrl: string;
	channelName: string;
}

export interface videoResource {
	kind: string;
	etag?: any;
	url: string;
	id:
		| string
		| {
				kind: string;
				videoId: string;
		  };
	// snippet: {
	publishedAt: Date | string;
	channelId: string;
	title: string;
	description: string;
	thumbnails: {
		default: {
			url: string;
			width: number;
			height: number;
		};
		medium: {
			url: string;
			width: number;
			height: number;
		};
		high: {
			url: string;
			width: number;
			height: number;
		};
	};
	channelTitle: string;
	playlistId?: string;
	position?: number;
	resourceId?: {
		kind: string;
		videoId: string;
	};
	publishTime: string;
	liveBroadcastContent: string;
	//   },
	contentDetails?: {
		videoId: string;
		startAt: string;
		endAt: string;
		note: string;
		videoPublishedAt: Date;
	};
	status?: {
		privacyStatus: string;
	};
}

export interface playlistResource {
	kind: string;
	etag?: any;
	nextPageToken: string;
	prevPageToken: string;
	pageInfo: {
		totalResult: number;
		resultsPerPage: number;
	};
	items: videoResource[];
}

export interface errorRequest {
	domain: string;
	reason: string;
	message: string;
	locationType: string;
	location: string;
}

export interface errorReponse {
	errors: errorRequest[];
	code: number;
	message: string;
}

export function isPlaylist(url: string): string {
	let index = url.match(/list=([^&]+)/g);
	return index && index[0].split('=').pop();
}

export class youtube {
	private key: string;
	public ms: boolean;
	protected apiUrl: string = 'https://www.googleapis.com/youtube/v3/';
	protected url: string = 'https://www.youtube.com/watch?v=';

	public constructor(token: string = null, getMs: boolean = false) {
		if (!token || typeof token !== 'string') throw new TypeError('Token invalid');
		this.key = token;
		this.ms = getMs;
	}

	async getInfo(url: string): Promise<ytdl.videoInfo> {
		try {
			const data = await ytdl.getInfo(url);
			return data;
		} catch {
			return undefined;
		}
	}

	async getPlaylist(playlistId: string = null): Promise<playlistResource> {
		if (!playlistId || typeof playlistId !== 'string') throw new TypeError('Invalid id');
		return new Promise((resolve, reject) => {
			superagent
				.get(this.apiUrl + 'playlistItems')
				.query({
					part: 'snippet',
					maxResults: 50,
					playlistId,
					key: this.key
				})
				.end(async (error, result) => {
					if (error || result.body['error'])
						reject({
							message: 'ERROR ON YTAPI:\n' + (error || result.body),
							data: {
								playlistId,
								error: result.body
							}
						});
					else {
						for (let element of result.body['items']) {
							element.url = this.url + element.snippet.resourceId.videoId;
							//element.seconds = await this.getDuration(element.url);
						}
						resolve(result.body['items']);
					}
				});
		});
	}

	async getDuration(url: string): Promise<number> {
		if (this.ms && ytdl.validateURL(url)) {
			//@ts-ignore
			return (await this.getInfo(url)).videoDetails.lengthSeconds * 1000;
		} else return 0;
	}

	async fetch(
		url: string
	): Promise<
		| { url: string; lenght_seconds?: number; title: string }
		| { url: string; lenght_seconds?: number; title: string }[]
	> {
		let video: string;
		if ((video = url.replace(/list=(.+?)(?:&)/g, '$2')) && video !== video) {
			return (await this.getPlaylist(video)).items.map((url: videoResource) => ({
				url: 'https://youtube.com/watch?v=' + url.resourceId.videoId,
				title: url.title
			}));
		} else {
			let index = await this.getInfo(video);
			return {
				title: index.videoDetails.title,
				url: index.videoDetails.video_url
			};
		}
	}

	async search(str: string): Promise<videoResource[] | errorReponse> {
		return new Promise((resolve, reject) => {
			superagent
				.get(this.apiUrl + 'search')
				.query({
					part: 'snippet',
					q: str,
					key: this.key,
					maxResults: 5
				})
				.end(async (error, result) => {
					if (result.body['error'] || error) reject(error || result.body);
					else {
						result.body = result.body['items'].map(
							(item: { url: string; id: { videoId: string }; snippet: any }) => {
								item.url = this.url + item.id.videoId;
								Object.assign(item, item.snippet);
								delete item.snippet;
								return item;
							}
						);
						for (let element of result.body) element.seconds = await this.getDuration(element.url);
						resolve(result.body);
					}
				});
		});
	}
}

export default exports;
