const { getWeather } = process.scr.utils;
const { embeds } = process.scr;

module.exports.help = {
	name: ['weather', 'погода'],
	usage: {
		en: 'weather <location>',
		ru: 'погода <локация>'
	},
	description: {
		en: 'Show current weather in defined location.',
		ru: 'Показывает погоду в указанной локации.'
	},
	permissions: ['SEND_MESSAGES'],
	bot_permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	owner: false,
	tag: 'utils'
};

module.exports.run = async (bot, message, args, language = 'en') => {
	if (!args.length)
		return message.channel.send(
			language === 'en'
				? 'Dude, what u need?'
				: 'Думаю, сегодня достаточно хорошая погода, чтобы не указывать аргументы.'
		);
	let weather = await getWeather(args.join(' '), language);
	if (weather) await message.channel.send(embeds.weatherLocation(weather, language));
	else await message.channel.send(embeds.cannotFindWeatherLocation(args.join(' '), language));
};
