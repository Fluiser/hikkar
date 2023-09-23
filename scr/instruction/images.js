const NekosFuckingClass = require('nekos.life');
const {fluxpointTOKEN} = require('../../json/bot_config.json');
const neko = new NekosFuckingClass();
const superagent = require('superagent');
const request = (url, headers = []) =>
	new Promise((resolve, reject) => {
		const req = superagent
			.get(url);
		for(const [h, v] of headers)
			req.set(h, v);
		req.end((error, result) => (error ? reject(error) : resolve(result.body || result)));
	});

const _exp = {
	porn: {},
	hentai: {},
	images: {}
};

const fluxpoint = {
	endpoint: 'https://gallery.fluxpoint.dev/api/',
	get: function() {
		return request(fluxpoint.endpoint + this, [['Authorization', fluxpointTOKEN]]).then(r => r.file);
	},
	hentai: [
		['nsfw/img/gasm', 			'gasm'],
		['nsfw/img/gasm', 			'ahegao'],
		['nsfw/img/azurlane', 		'azurlane'],
		['nsfw/img/feet', 			'feet'],
		['nsfw/gif/feet', 			'feet'],
		['nsfw/gif/cum', 			'cum'],
		['nsfw/img/cum', 			'cum'],
		['nsfw/img/blowjob', 		'blowjob'],
		['nsfw/gif/blowjob',		'blowjob'],
		['nsfw/img/solo', 			'solo'],
		['nsfw/gif/solo', 			'solo'],
		['nsfw/img/neko', 			'neko'],
		['nsfw/gif/neko', 			'neko'],
		['nsfw/img/boobs', 			'boobs'],
		['nsfw/gif/boobs', 			'boobs'],
		['nsfw/img/anal', 			'anal'],
		['nsfw/gif/anal', 			'anal'],
		['nsfw/img/pussy', 			'pussy'],
		['nsfw/gif/pussy', 			'pussy'],
		['nsfw/img/yuri', 			'yuri'],
		['nsfw/gif/yuri', 			'yuri'],
		['nsfw/img/bdsm', 			'bdsm'],
		['nsfw/gif/bdsm', 			'bdsm'],
		['nsfw/img/futa', 			'futa'],
		['nsfw/gif/futa', 			'futa'],
		['nsfw/gif/hentai', 		'hentai'],
		['nsfw/gif/spank', 			'spank'],
		['nsfw/img/ass', 			'ass'],
		['nsfw/gif/ass', 			'ass'],
		['nsfw/img/kitsune', 		'kitsune'],
		['nsfw/gif/kitsune', 		'kitsune'],
		['nsfw/img/femdom', 		'femdom'],
		['nsfw/gif/femdom', 		'femdom'],
		['nsfw/img/nekopara', 		'nekopara'],
		['nsfw/img/lewd', 			'lewd'],
		['nsfw/img/cosplay', 		'cosplay'],
		['nsfw/img/petplay', 		'petplay'],
		['nsfw/img/trap', 			'trap'],
		['nsfw/img/anus', 			'anus'],
		['nsfw/img/holo', 			'holo'],
		['nsfw/img/yaoi', 			'yaoi']
	],
	images: [
		['nsfw/img/pantyhose', 		'pantyhose']
		['sfw/img/neko', 			'neko'],
		['sfw/img/kitsune', 		'kitsune'],
		['sfw/img/kitsune',     	'kitsune'],
		['sfw/img/holo',        	'holo'],
		['sfw/img/christmas',   	'christmas'],
		['sfw/img/maid',        	'maid'],
		['sfw/img/nekopara',    	'nekopara'],
		['sfw/img/azurlane',    	'azurlane'],
		['sfw/img/senko',       	'senko'],
		['sfw/img/ddlc',        	'ddlc'],
		['sfw/img/wallpaper',   	'wallpaper'],
		['sfw/img/anime',       	'anime'],
		['sfw/img/meme',        	'meme'],
		['sfw/img/nou',         	'nou'],
		['sfw/img/pog',         	'pog'],
		['sfw/img/cat',         	'cat'],
		['sfw/img/dog',         	'dog'],
		['sfw/img/lizard',      	'lizard'],
		['sfw/gif/baka',            'baka'],
		['sfw/gif/bite',            'bite'],
		['sfw/gif/blush',           'blush'],
		['sfw/gif/cry',             'cry'],
		['sfw/gif/dance',           'dance'],
		['sfw/gif/feed',            'feed'],
		['sfw/gif/fluff',           'fluff'],
		['sfw/gif/fluff',           'tail'],
		['sfw/gif/grab',            'grab'],
		['sfw/gif/handhold',        'handhold'],
		['sfw/gif/highfive',        'highfive'],
		['sfw/gif/hug',             'hug'],
		['sfw/gif/kiss',            'kiss'],
		['sfw/gif/lick',            'lick'],
		['sfw/gif/neko',            'neko'],
		['sfw/gif/pat',             'pat'],
		['sfw/gif/poke',            'poke'],
		['sfw/gif/punch',           'punch'],
		['sfw/gif/shrug',           'shrug'],
		['sfw/gif/slap',            'slap'],
		['sfw/gif/smug',            'smug'],
		['sfw/gif/stare',           'stare'],
		['sfw/gif/tickle',          'tickle'],
		['sfw/gif/wag',             'wag'],
		['sfw/gif/wasted',          'wasted'],
		['sfw/gif/wave',            'wave'],
		['sfw/gif/wink',            'wink']
	]
};

const nekobotAPI = {
	endpoint: 'https://nekobot.xyz/api/image?type=',
	get: async function () {
		const data = await request(nekobotAPI.endpoint + this);
		if (data.success) return data.message;
		else {
			processe.emit('system', { trace: __dirname + __filename + ': error get image', ...data });
		}
	},
	porn: [
		// 'midriff',
		'pgif',
		'4k',
		'anal',
		'gonewild',
		'ass',
		'pussy'
	],
	hentai: [
		'hentai',
		['hneko', 'neko'],
		['nkitsune', 'kitsune'],
		['hkitsune', 'kitsune'],
		['hanal', 'anal'],
		['hthigh', 'thigh'],
		'paizuri',
		'tentacle',
		['hboobs', 'boobs'],
		['hass', 'ass'],
		['hmidriff', 'midriff']
	],
	images: [
		'holo',
		'neko',
		'kemonomimi',
		'kanna',
		'thigh',
		// ['gah', ['ohmygod', 'ohm']]
		'coffee',
		'food'
	]
};

const nekos_life = {
	hentai: {
		// anal: () => neko.nsfw.anal().then(r => r.url),
		// hentaigif: () => neko.nsfw.randomHentaiGif().then(r => r.url),
		// pussy: () =>
		// 	[neko.nsfw.pussy, neko.nsfw.pussyArt, neko.nsfw.pussyWankGif]
		// 		.random()()
		// 		.then(r => r.url),
		// neko: () =>
		// 	[neko.nsfw.neko, neko.nsfw.nekoGif, neko.nsfw.eroNeko]
		// 		.random()()
		// 		.then(r => r.url),
		// lesbian: () => neko.nsfw.lesbian().then(r => r.url),
		// kuni: () => neko.nsfw.kuni().then(r => r.url),
		// classic: () => neko.nsfw.classic().then(r => r.url),
		// boobs: () => neko.nsfw.boobs().then(r => r.url),
		// bj: () => neko.nsfw.bJ().then(r => r.url),
		// avatar: () => neko.nsfw.avatar().then(r => r.url),
		// yuri: () => neko.nsfw.yuri().then(r => r.url),
		// trap: () => neko.nsfw.trap().then(r => r.url),
		// futanari: () => neko.nsfw.futanari().then(r => r.url),
		// tits: () => neko.nsfw.tits().then(r => r.url),
		// girlsolo: () =>
		// 	[neko.nsfw.girlSolo, neko.nsfw.girlSoloGif]
		// 		.random()()
		// 		.then(r => r.url),
		// kemonomimi: () => neko.nsfw.kemonomimi().then(r => r.url),
		// kitsune: () => neko.nsfw.kitsune().then(r => r.url),
		// keta: () => neko.nsfw.keta().then(r => r.url),
		// holo: () =>
		// 	[neko.nsfw.holo, neko.nsfw.holoEro]
		// 		.random()()
		// 		.then(r => r.url),
		// hentai: () => neko.nsfw.hentai().then(r => r.url),
		// femdom: () => neko.nsfw.femdom().then(r => r.url),
		// feet: () =>
		// 	[neko.nsfw.eroFeet, neko.nsfw.feet, neko.nsfw.feetGif]
		// 		.random()()
		// 		.then(r => r.url),
		// ero: () =>
		// 	['', 'Kitsune', 'Kemonomimi', 'Neko', 'Yuri']
		// 		.map(e => 'ero' + e)
		// 		.map(key => neko.nsfw[key])
		// 		.random()()
		// 		.then(r => r.url),
		// cumarts: () => neko.nsfw.cumArts().then(r => r.url),
		// cumsluts: () => neko.nsfw.cumsluts().then(r => r.url),
		// cum: function () {
		// 	return ([nekos_life.hentai.cumsluts, nekos_life.hentai.cumarts].random())();
		// },
		// blowjob: () => neko.nsfw.blowJob().then(r => r.url),
		spank: () => neko.nsfw.spank().then(r => r.url),
		gasm: () => neko.nsfw.gasm().then(r => r.url)
	},
	images: {
		tickle: () => neko.sfw.tickle().then(r => r.url),
		slap: () => neko.sfw.slap().then(r => r.url),
		// baka: () => neko.sfw.baka().then(r => r.url),
		// poke: () => neko.sfw.poke().then(r => r.url),
		pat: () => neko.sfw.pat().then(r => r.url),
		neko: () => neko.sfw.neko().then(r => r.url),
		nekogif: () => neko.sfw.nekoGif().then(r => r.url),
		lizard: () => neko.sfw.lizard().then(r => r.url),
		kiss: () => neko.sfw.kiss().then(r => r.url),
		hug: () => neko.sfw.hug().then(r => r.url),
		foxgirl: () => neko.sfw.foxGirl().then(r => r.url),
		feed: () => neko.sfw.feed().then(r => r.url),
		cuddle: () => neko.sfw.cuddle().then(r => r.url),
		woof: () => neko.sfw.woof().then(r => r.url),
		// why: () => neko.sfw.why().then(r => r.why),
		// cattext: () => neko.sfw.catText().then(r => r.cat),
		// fact: () => neko.sfw.fact().then(r => r.fact),
		// kemonomimi: () => neko.sfw.kemonomimi().then(r => r.url),
		// holo: () => neko.sfw.holo().then(r => r.url),
		avatar: () => neko.sfw.avatar().then(r => r.url),
		waifu: () => neko.sfw.waifu().then(r => r.url),
		gecg: () => neko.sfw.gecg().then(r => r.url),
		goose: () => neko.sfw.goose().then(r => r.url),
		wallpaper: () => neko.sfw.wallpaper().then(r => r.url),
		smug: () => neko.sfw.smug().then(r => r.url)
	}
};

const __types = ['porn', 'hentai', 'images'];

//Initializer api GET
for (const api of [nekobotAPI, fluxpoint]) {
	for (const type of __types) {
		if (!Array.isArray(api[type])) continue;
		const _ = {}; 
		for(const apiEndpoint of api[type]) {
			const prevFunction = Array.isArray(apiEndpoint) ? _[apiEndpoint[1]] : _[apiEndpoint]; // ебаться в жс
			if(Array.isArray(apiEndpoint)) {
				_[apiEndpoint[1]] = (typeof _[apiEndpoint[1]] === 'function' ?
										() => ([ prevFunction, api.get.bind(apiEndpoint[0])])[Math.floor(Math.random()*2)]() :
										api.get.bind(apiEndpoint[0]));
			} else {
				_[apiEndpoint] = (typeof _[apiEndpoint] === 'function' ?
									() => ([ prevFunction, api.get.bind(apiEndpoint)])[Math.floor(Math.random()*2)]() : 
									api.get.bind(apiEndpoint));
			}
		}
		api[type] = _;
	}
}

//Handles
for (const api of [nekobotAPI, nekos_life, fluxpoint]) {
	for (const type of __types) {
		if (!api[type]) continue;
		for (const k of Object.keys(api[type])) {
			if (_exp[type][k]) _exp[type][k] = () => [_exp[type][k], api[type][k]].random()();
			else _exp[type][k] = api[type][k];
		}
	}
}

_exp.sfw = _exp.images;
_exp.nsfw = {};
// Только про порнуху. Ассимиляция под nsfw <- hentai, porn
for (const [key, value] of Object.entries(_exp.porn).concat(Object.entries(_exp.hentai))) {
	if (_exp.nsfw[key]) {
		const ___value = _exp.nsfw[key];
		_exp.nsfw[key] = () => [value, ___value].random()();
	} else _exp.nsfw[key] = value;
}
Object.assign(module.exports, _exp);