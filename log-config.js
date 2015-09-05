var log4js = require('log4js');

log4js.configure({
	appenders: [
		{
			type: "dateFile",
			category: "system",
			filename: "logs/system.log",
			pattern: "-yyyy-MM-dd",
			backups: 3
		},
		{
			type: "dateFile",
			category: "create",
			filename: "logs/create.log",
			pattern: "-yyyy-MM-dd",
			backups: 3
		},
		{
			type: "dateFile",
			category: "post",
			filename: "logs/post.log",
			pattern: "-yyyy-MM-dd",
			backups: 3
		}
	]
});

module.exports = log4js;
