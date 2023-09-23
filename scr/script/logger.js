const { Console } = require('console');
const { Writable } = require('stream');
const { createWriteStream } = require('fs');

class logger extends Writable {
	constructor(streams) {
		super();
		this.streams = new Set();
		if (streams) for (let stream of streams instanceof Set ? streams.values() : streams) this.attach(stream);
	}

	attach(stream) {
		this.streams.add(stream);
	}

	write(arg, ...altargs) {
		for (let stream of this.streams.values())
			stream.write(`[${process.timeFormat(Date.now(), 'ru')}] ${arg}`, ...altargs);
	}
}

module.exports = function (dir, streams = []) {
	// const log = typeof dir === 'string' ? createWriteStream(dir) : dir;
	const stream = new logger([process.stdout, ...streams]);
	global.console = new Console({ stderr: stream, stdout: stream });
};
