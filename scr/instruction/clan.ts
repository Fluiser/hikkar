import { User } from 'discord.js';
import * as sqlTypes from '../types/sqlTypes';

//TODO
export async function createClan() {}
//TODO
export class clan {
	public data: sqlTypes.clan;
	public members: string[];
	public id: string;

	constructor(id: string | User) {}
}
