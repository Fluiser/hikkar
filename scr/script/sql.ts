import sqlPatterns from './sqlPatterns';
import { sqlCall } from './utils';

function handleValue(value: number | any): string {
	return typeof value === 'number' ? value.toString() : `'${String(value).replace(/\'/g, "\\'")}'`;
}

export async function getAll<T = object, T2 = object>(
	table: string,
	values: T2 = null,
	...insertArgs: unknown[]
): Promise<T[]> {
	let query: string = `SELECT * FROM ${table} `;
	if (values)
		query += Object.entries(values)
			.map(([key, value], index) => `${index ? 'AND' : 'WHERE'} ${key} = ${handleValue(value)}`)
			.join(' ');
	let result: object[] = await (insertArgs.length
		? sqlCall(query, sqlPatterns[table], ...insertArgs)
		: sqlCall(query));
	//@ts-ignore   d sa
	return result;
}

export async function get<T = object, T2 = object>(
	table: string,
	values: T2 = null,
	...insertArgs: unknown[]
): Promise<T> {
	let query: string = `SELECT * FROM ${table} `;
	if (values)
		query += Object.entries(values)
			.map(([key, value], index) => `${index ? 'AND' : 'WHERE'} ${key} = ${handleValue(value)}`)
			.join(' ');
	let index: T[];
	index = await (insertArgs.length
		? sqlCall(query + ' LIMIT 1', sqlPatterns[table], ...insertArgs)
		: sqlCall(query + ' LIMIT 1'));
	//@ts-ignore
	return index[0];
}

export async function update<T = object>(table: string, newvalues: T, where: T = null): Promise<void> {
	let query = `UPDATE ${table} `;
	query += `SET ${Object.entries(newvalues)
		.map(([key, value]) => `${key} = ${handleValue(value)}`)
		.join(', ')} `;
	if (where)
		query += `${Object.entries(where)
			.map(([key, value], index) => `${index ? 'AND' : 'WHERE'} ${key} = ${handleValue(value)}`)
			.join(', ')}`;
	await sqlCall(query);
}

//@ts-ignore
export async function insert<T = object>(table: string, args: T = {}): Promise<void> {
	let keys: string[] = [],
		values: any[] = [];
	for (let [key, value] of Object.entries(args)) {
		keys.push(key);
		values.push(handleValue(value));
	}
	await sqlCall(`INSERT INTO ${table}(${keys.join(', ')}) VALUES(${values.join(', ')})`);
}

export async function remove<T = object>(table: string, where: T = null): Promise<void> {
	let query = `DELETE FROM ${table} `;
	if (where)
		query += Object.entries(where)
			.map(([key, value], index) => `${index ? 'AND' : 'WHERE'} ${key} = ${handleValue(value)}`)
			.join(', ');
	await sqlCall(query);
}
