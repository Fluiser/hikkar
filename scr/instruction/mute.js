const sql = require('../../dist/script/sql.js');
const { mute: sqlPatternMute } = require('../../dist/script/sqlPatterns.js');
/*
 * Mute table:
 * @String user_id
 * @String guild_id
 * @Number time
 * @String roles
 * */

/*
* user_id:     discord.User|string,
                           guild_id:    discord.Guild|string,
                           time:        Date|number,
                           roles:       discord.Collection<unknown,unknown> |
                                        Array<unknown> |
                                        string ): Promise<void>
* */

const __null_date = 1641848400000; // 2021.01.11

const dataConvert = (date, original = true) => original ?  Math.trunc((date-__null_date)/1000) : date*1000+__null_date;

module.exports = {
	async add(user_id, guild_id, roles, time) {
		const _d = await sql.get('mute', {user_id, guild_id});
		if(_d)
			await sql.update('mute', {time, roles}, {user_id, guild_id});
		else
			await sqlPatternMute(user_id, guild_id, dataConvert(time), roles);
	},
	async remove(
					user_id,
					guild_id) {
		await sql.remove('mute', {user_id, guild_id});
	},
	async handle(client, member, coroutineTask = false) {
		const _d = await sql.get('mute', {user_id: member.id, guild_id: member.guild.id});
		if(!_d) return false;
		if(dataConvert(_d.time, false) >= Date.now()) {
			const botRolePos = Math.max(...member.guild.members.cache.get(bot.user.id).roles.cache.map(r => r.position));
			const roles = _d.roles.split(';').map(r => member.guild.roles.cache.get(r.id)).filter(role => role && role.position < botRolePos);
			await member.roles.add(roles);
			return true;
		}
		if(!coroutineTask) return false;
		if(Date.now()-dataConvert(_d.time, false) <= 10800000 /*3 hours*/)
			return await this.handle.call(this, client, member, coroutineTask);
	}
};