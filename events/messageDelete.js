const { sql } = process.scr;
const { MessageEmbed } = require('discord.js');
const { locales } = process.scr;

module.exports.e = "messageDelete";
module.exports.r = async message => {
    if (message.author.bot) return;
    if (message.channel.type !== 'text') return;

    const db_guild = await sql.get('guild_options', { id: message.guild.id }, message.guild);
    if (!db_guild || !db_guild.msgupd) return;

    const channel = message.guild.channels.cache.get(db_guild.msgupd);
    if (!channel || (message.channel.nsfw && !channel.nsfw && !db_guild.ignoreNsfw[0])) return;

    const { language } = await sql.get('guilds_info', { id: message.guild.id }, message.guild);

    const embed = new MessageEmbed().setColor(16711680);
    embed.setAuthor(message.author.tag, message.author.avatarURL({ size: 1024 }));
    if (message.content) embed.setDescription(message.content);
    embed.addField(
        locales.system.msgupd.msgData[language],
        `Id: ${message.id}\nCh: ${message.channel} (${message.channel.id})\nBy ${message.author} (${message.author.id})`
    );

    if (message.attachments.size) {
        const attachments = message.attachments
            .map(a => `[${a.name}](${a.url})`)
            .join('\n')
            .list(1024, '\n');
        const imgAttachment = message.attachments.find(file => imageFormat.some(format => file.name.endsWith(format)));

        if (imgAttachment) embed.setImage(imgAttachment.url);

        for (let i = 0; i < 10 && i < attachments.length; ++i) {
            embed.addField(`files[${i + 1}/${attachments.length}]`, attachments[i], true);
        }
    }

    channel.send(embed);
};