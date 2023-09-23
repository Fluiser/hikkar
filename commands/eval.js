const { getDuration } = process.scr.utils;
const { embeds } = process.scr;

module.exports.help = {
	name: ['eval'],
	usage: {},
	description: {
		ru: 'Как в том анекдоте.\n-Ёбнет?\n-Не должно.\n-А хуль ты тогда отходишь?'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: true,
	tag: 'sudo'
};

module.exports.run = async (bot, message, args) => {
	bot.emit('system', message, {
		type: 'eval',
		exe: () => {
			args = args.join(' ').replace(/```(\w{1,}|)\n([^]+)```/g, '$2');
			return new Promise(r => {
				getDuration(
					() => {
						let result;
						try {
							result = eval(args);
						} catch (err) {
							result = err;
						}
						return result;
					},
					(end, result) => {
						r({
							time: end,
							result: result
						});
					}
				);
			});
		}
	});
};
