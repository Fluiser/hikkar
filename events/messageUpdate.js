const { sql } = process.scr;
const { MessageEmbed } = require('discord.js');
const { locales } = process.scr;

module.exports.e = "messageUpdate";

module.exports.r = async (oldmsg, newmsg) => {
    if (oldmsg.author.bot) return;
    if (oldmsg.channel.type !== 'text') return;
    if (
        oldmsg.embeds.length !== newmsg.embeds.length ||
        (oldmsg.content === newmsg.content && oldmsg.attachments.size === newmsg.attachments.size)
    )
        return;

    const db_guild = await sql.get('guild_options', { id: oldmsg.guild.id }, oldmsg.guild);
    if (!db_guild.msgupd) return;

    const channel = oldmsg.guild.channels.cache.get(db_guild.msgupd);
    if (
        !channel ||
        (oldmsg.channel.nsfw && !channel.nsfw && !db_guild.ignoreNsfw[0]) ||
        !channel.hasBotPermission(['SEND_MESSAGES', 'EMBED_LINKS'])
    )
        return;

    const { language } = await sql.get('guilds_info', { id: oldmsg.guild.id }, oldmsg.guild);

    const embed = new MessageEmbed().setColor(16768256);
    embed.setAuthor(oldmsg.author.tag, oldmsg.author.avatarURL({ size: 1024 }));
    embed.setDescription(`**${locales.system.msgupd.updOld[language]}:**\n${oldmsg.content}`);
    if(newmsg.content.length)
        embed.addField(
            locales.system.msgupd.updNew[language],
            newmsg.content.length > 1024 ? newmsg.content.slice(0, 1021) + '...' : newmsg.content
        );
    embed.addField(
        locales.system.msgupd.msgData[language],
        `[URL](${newmsg.url})\nId: ${newmsg.id}\nCh: ${oldmsg.channel} (${oldmsg.channel.id})\nBy ${oldmsg.author} (${oldmsg.author.id})`
    );

    if (oldmsg.attachments.size !== newmsg.attachments.size) {
        const updattachments = [];
        if (oldmsg.attachments.size < newmsg.attachments.size)
            for (const attach of newmsg.attachments.values()) {
                if (!oldmsg.attachments.has(attach.id)) updattachments.push(attach);
            }
        else
            for (const attach of oldmsg.attachments.values()) {
                if (!newmsg.attachments.has(attach.id)) updattachments.push(attach);
            }

        const textAttachments = updattachments
            .map(a => `[${a.name}](${a.proxyURL})`)
            .join('\n')
            .list(1024, '\n');

        for (let i = 0; i < textAttachments.length; ++i)
            embed.addField(
                (oldmsg.attachments.size > newmsg.attachments.size
                    ? locales.system.msgupd.adel
                    : locales.system.msgupd.anew)[language] +
                '[' +
                (i + 1) +
                ']',
                textAttachments[i]
            );
        if (!embed.image)
            embed.image = updattachments.find(a => imageFormat.some(format => a.name.endsWith(format))) || null;
    }
    channel.send(embed);
};