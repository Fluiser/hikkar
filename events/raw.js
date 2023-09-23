const { sql } = process.scr;
const { bot } = process;

module.exports.e = 'raw';

module.exports.r = async (event) => {
    if(!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(event.t)) return;
    try{
        const guild = bot.guilds.cache.get(event.d.guild_id);
        let message;
        try{
            message = await guild.channels.cache.get(event.d.channel_id).messages.fetch(event.d.message_id);
        } catch { return; }
        if(!message) return;
        if(message.author.bot) return;
        await guild.star(message);
    } catch(err) {
        bot.emit('system_error', err);
    }
};