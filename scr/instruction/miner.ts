import { User } from 'discord.js';

interface Miner {
	name: {
		[language: string]: string;
	};
	price: number;
	exp?: {
		item: string;
		length: number | number[];
		chance?: number;
	}[];
}

//@ts-ignore
const Miners: { [name_id: string]: Miner } = process.json.miners;

function MinerFind(data: string): Miner {
	return (
		Miners[data] ||
		Object.values(Miners).find((value: Miner) => {
			return Object.values(value.name).some(nameLanguage => nameLanguage.includes(data));
		})
	);
}

module.exports = class {
	public user: { id: string } | User;

	constructor(user: string | User) {
		this.user = typeof user === 'string' ? { id: user } : user;
	}

	async load(): Promise<void> {}
};
