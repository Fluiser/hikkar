import { Readable } from 'stream';
import ytdl, { getInfo } from 'ytdl-core';

export interface options {
	cache?: boolean;
	limitAttempts?: number;
}

export class ytStream {
	url: string;
	stream: Readable;
	work: boolean;
	cachedInfo: ytdl.videoInfo;
	limitAttempts: number;
	options: options;

	public constructor(url: string, options: options = { cache: true, limitAttempts: 5 }) {
		if (!url) throw new TypeError('Invalid url');

		this.url = url;
		this.stream = new Readable();
		this.work = false;
		this.limitAttempts = options.limitAttempts;
		this.options = options;

		if (options.cache) this.getInfo().then(r => (this.cachedInfo = r));

		this.stream._read = function (): void {};

		return this;
	}

	private async getInfo(): Promise<ytdl.videoInfo> {
		let info: ytdl.videoInfo;
		try {
			info = await getInfo(this.url);
		} catch {
			info = await getInfo(this.url);
		}
		return info;
	}

	private liveRead(): void {
		ytdl(this.url)
			.on('data', d => this.stream.push(d))
			.on('end', async () => {
				if (!this.work) return;
				if ((await this.getInfo()).player_response.videoDetails.isLiveContent) this.liveRead();
				else this.stream.push(null);
			});
	}

	public stop(): void {
		this.work = false;
	}

	public async read(attempts: number = 0): Promise<Readable> {
		this.work = true;
		try {
			if ((await this.getInfo()).player_response.videoDetails.isLiveContent) this.liveRead();
			else this.stream = ytdl(this.url, { filter: 'audio'});
		} catch (err) {
			if (attempts > this.limitAttempts) throw new Error('Cannot read video');
			return this.read(++attempts);
		}
		return this.stream;
	}
}

export default ytStream;
