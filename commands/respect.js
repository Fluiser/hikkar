const { sqlPatterns, embeds } = process.scr;
const { MessageEmbed } = require('discord.js');
const { sqlCall } = process.scr.utils;
const { system } = process.json.locales;

module.exports.help = {
	name: ['respect', 'upvote', 'похвалить', 'f'],
	usage: {
		en: 'respect <user>',
		ru: 'похвалить <юзер>'
	},
	description: {
		en: 'Press F for worthy user!',
		ru: 'Нажмите F ради достойного пользователя!'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'social'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	let member = message.guild.member(args[0]) || message.mentions.members.first();

	if (!member) return message.channel.send(embeds.noArgs(message, language));
	let [respected] = await sqlCall(
		`SELECT * FROM respect WHERE author_id = '${message.author.id}' AND target_id = '${member.id}'`
	);
	if (member.id === bot.user.id) return message.channel.send('❤️');
	if (member.user.bot) return message.channel.send(embeds.error(message, system.argumentIsBot[language]));
	if (respected)
		return message.channel.send(
			embeds.error(
				message,
				language === 'en' ? 'You have already given respect it user.' : 'Вы уже оказали уважение этому юзеру.'
			)
		);
	else {
		await sqlCall(`SELECT * FROM profiles WHERE id = '${member.id}'`, sqlPatterns.profile, member.user);
		await sqlPatterns.respect(message.author, member.user);
		await sqlCall(`UPDATE profiles SET reputation = reputation+1 WHERE id = '${member.id}'`);
		if (member.id === message.author.id)
			await message.channel.send(language === 'en' ? 'Ok, dude.' : 'Ну, ладно...');
		else
			await message.channel.send(
				new MessageEmbed()
					.setColor('#00FF00')
					.setDescription(
						language === 'en'
							? `<@${message.author.id}> Pressed F for <@${member.id}>`
							: `<@${message.author.id}> Отдал респект <@${member.id}>`
					)
					.setImage('https://i.imgur.com/9IPm2JH.png')
			);
	}
};
