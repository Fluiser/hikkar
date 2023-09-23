import { get, Response } from 'superagent';
const { osu: token } = require('../../json/bot_config.json');
const endpoint = 'https://osu.ppy.sh/api/';
const modes: { [k: string]: number } = {
	osu: 0,
	taiko: 1,
	catch: 2,
	mania: 3
};

export interface user {
	user_id: string;
	username: string;
	join_date: string;
	count300: string;
	count100: string;
	count50: string;
	playcount: string;
	ranked_score: string;
	total_score: string;
	pp_rank: string;
	level: string;
	pp_raw: string;
	accuracy: string;
	count_rank_ss: string;
	count_rank_ssh: string;
	count_rank_s: string;
	count_rank_sh: string;
	count_rank_a: string;
	country: string;
	total_seconds_played: string;
	pp_country_rank: string;
	events: [
		{
			[key: string]: any;
		}
	];
}

module.exports = exports = class osu {
	public query<T>(method: string, query: object): Promise<T> {
		return new Promise((resolve, reject) => {
			get(endpoint + method)
				.set('User-Agent', '</fluiser>')
				.query(Object.assign({}, query, { k: token }))
				.end((error: Error, result: Response) => {
					if (error) reject(error.message);
					else resolve(result.body);
				});
		});
	}

	constructor() {}

	public getMode(mode: string): number {
		return modes[mode.toLowerCase()] || 0;
	}

	public async getUser(u: string, mode: string | number = 0): Promise<user> {
		if (!u) return null;
		else
			return (
				await this.query<user[]>('get_user', { u, m: typeof mode === 'string' ? this.getMode(mode) : mode })
			)[0];
	}
};
