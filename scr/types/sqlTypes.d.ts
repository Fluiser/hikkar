import { __song__ } from '../instruction/playlist';

export interface profiles {
	id?: string;
	level?: number;
	xp?: number;
	reputation?: number;
	money?: number;
	about?: string;
	message?: number;
}

export interface respect {
	author_id?: string;
	target_id?: string;
}

export interface guilds_info {
	id?: string;
	prefix?: string;
	language?: string;
	messages?: number;
	volume?: number;
}

export interface waifu {
	id?: string;
	waifu_id?: string;
}

export interface blockusers {
	id?: string;
	reason?: string;
}

export interface memberslevel {
	id?: string;
	guild_id?: string;
	level?: number;
	xp?: number;
}

export interface guilds_options {
	id?: string;
	ignoreNsfw?: Buffer;
	moderationChannel?: string;
	logChannel?: string;
	starboardChannel?: string;
	starSize?: number;
}

export interface starboard {
	message_id?: string;
	star_id?: string;
}

export interface playlist {
	id?: number;
	name?: string;
	author?: string;
	songs?: string | __song__ /* [{...}] */;
}
//
export interface game {
	user_id?: string;
	object?: string;
	x: number;
	y: number;
	cache?: string;
}

export interface inventory {
	user: string;
	item: string;
	length: number;
}

export interface clan {
	id?: string;
	name?: string;
	owner_id?: string;
}

export interface clanUsers {
	id?: string;
	member?: string;
}

export interface ignoreChannels {
	id?: string;
}

export interface osu {
	id?: string;
	username?: string;
	mode?: number;
}

export interface miner {
	user_id: string;
	data?: string;
}

export interface inventory {
	user_id: string;
	data?: string;
}
