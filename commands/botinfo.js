const {MessageEmbed} = require('discord.js');
const { locales } = process.json;
const os = require('os');
const {durationFormat} = process.scr.utils;

module.exports.help = {
	name: ['botinfo', 'binfo', 'bifo', 'бинфо', "ботинфо"],
	usage: {
		en: 'binfo',
		ru: 'бинфо'
	},
	description: {
		en: 'It does not make sense.',
		ru: 'Это не имеет смысла.'
	},
	permissions: [],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'standart'
};

module.exports.run = async(bot, message, args, lang) => {
    const e = new MessageEmbed();

//"%v\nЭмодзи: %v\nUptime: %v\n\nВерсия: `%v`",

    e.setDescription(locales.commands.botinfo[lang].format(
        (bot.shard && bot.shard.count || 0),
        (process.memoryUsage().rss/1024/1024).toFixed(2) + 'mb / ' + (os.totalmem()/1024/1024/1024).toFixed(2) + `gb | {${(os.freemem()/1024/1024).toFixed(2)}}`,
        bot.guilds.cache.size,
        bot.users.cache.size,
        bot.channels.cache.size,
        bot.emojis.cache.size,
        durationFormat(process.uptime()*1000, lang),
        bot.version
        //'\n\ndiscord.gg/zFDNYNyCBa'
    ));

    await message.channel.send('discord.gg/zFDNYNyCBa', e);
};
