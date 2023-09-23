const { sql } = process.scr;
const { locales } = process.json;
const { embeds } = process.scr;
const {
	MessageEmbed,
	GuildAuditLogs: { Actions }
} = require('discord.js');

//RGB
const static_colors = {
	channelCreate: 0x00ff00,
	channelUpdate: 0xffff00,
	channelDelete: 0xff0000
};

const static_types = {
	channelCreate: Actions.CHANNEL_CREATE,
	channelUpdate: Actions.CHANNEL_UPDATE,
	channelDelete: Actions.CHANNEL_DELETE
};

async function handle(event, channel, new_channel) {
	if (['dm', 'unknown'].includes(channel.type)) return;

	const db_guild = await sql.get('guild_options', { id: channel.guild.id }, channel.guild);
	if (!db_guild.logChannel) return;

	const logChannel = channel.guild.channels.cache.get(db_guild.logChannel);
	if (!logChannel || !logChannel.hasBotPermission(['SEND_MESSAGES', 'EMBED_LINKS'])) return;

	const { language } = await sql.get('guilds_info', { id: channel.guild.id }, channel.guild);
	const log = await channel.guild.fetchAuditLogs({ limit: 1, type: static_types[event] });
	const d_log = log.entries.first();

	if (!d_log || d_log.target.id != channel.id) return;

	const embed = new MessageEmbed().setColor(static_colors[event]);
	embed.setAuthor(locales.logs.channels[event][language], channel.guild.iconURL({ size: 1024 }));

	if (d_log.executor.bot) return;

	{
		let desc = '';
		if (event === 'channelUpdate') {
			if (channel.name != new_channel.name) desc += `[\`${channel.name}\` -> **${new_channel.name}**]`;
			if (channel.topic != new_channel.topic)
				desc += `\n${locales.logs.channels.desc.__topic[language].format(channel.topic, new_channel.topic)}`;
		}
		embed.setDescription(
			locales.logs.channels.desc[language].format(
				event === 'channelUpdate' ? `${channel} ${desc}` : `${channel.name}`,
				d_log.executor,
				channel.id,
				locales.channelsType[language][channel.type],
				channel.parent ? channel.parent : locales.logs.channels.notParent[language]
			)
		);
		// if(event === "channelUpdate") {
		//     if(channel.name != old_channel)
		// }
	}
	await logChannel.send(embed);
}

module.exports = Object.keys(static_types).map(event => ({
	event,
	run: async (...args) => await handle(event, ...args)
}));
