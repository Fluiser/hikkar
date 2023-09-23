const { clearMsgs } = process.scr.utils;
const { embeds } = process.scr;

module.exports.help = {
	name: ['clear', 'очистить'],
	usage: {
		en: 'clear *<member> <count>',
		ru: 'удалить *<участник> <кол-во>'
	},
	description: {
		en: 'Deleting defined count messages in channel. Count for delete messages: 1-5000.',
		ru: 'Удаляет указанное кол-во сообщение. Кол-во для удаления сообщений: 1-5000.'
	},
	permissions: ['MANAGE_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'MANAGE_MESSAGES'],
	owner: false,
	tag: 'chat'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let count = +(args.length > 1 ? args[1] : args[0]);
	let member = args.length > 1 ? message.guild.member(args[0]) || message.mentions.members.first() : undefined;

	if (Number.isNaN(count) || count > 5000 || count < 1)
		return message.channel.send(
			embeds.error(
				message,
				language === 'en'
					? 'You defined incorrect argument.\nCount deleted messages must be less 5000 or number.'
					: 'Ты указал некорректное кол-во сообщений.\nКол-во сообщений должно быть меньше 5000, или должно быть числом.'
			)
		);

	count = Math.floor(count);
	await message.delete().catch(err => {/* Ну ебаться в сапоги. Как так то? */});

	if (!process.cooldownMessagesDelete) process.cooldownMessagesDelete = new Set();

	if (!process.cooldownMessagesDelete.has(message.channel.id)) {
		setTimeout(() => {
			process.cooldownMessagesDelete.delete(message.channel.id);
		}, 250 * (count / 4));
		process.cooldownMessagesDelete.add(message.channel.id);
		try {
			await clearMsgs(message.channel, count, member);
			await message.channel.send('✅').then(msg => !msg.deleted && msg.delete({ timeout: 2500 }).catch(err => {/*Мда.*/}));
		} catch {}
	}
};
