module.event = 'guildDelete';
module.exe = async function(guild) {
    const owner = guild.owner;
    if(!owner || !owner.user) return;
    if(
        guild.client.shard && !(await guild.client.shard.broadcastEval(`this.users.cache.size < 50000 && this.users.cache.has('${owner.user.id}')`)).some(e => e) ||
        process.blockedUsers.has(owner.user.id)
    ) return;
    await owner.user.send({
        embed: {
            description: `💔 ${guild.name} (${guild.id})`,
            image:{
                url: "https://i.imgur.com/NpREtIU.png"
            }
        }
    });
}