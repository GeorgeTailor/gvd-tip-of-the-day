const { Client, Intents, MessageEmbed } = require('discord.js');
const http = require('http');
const fs = require('fs');
const tips = require('./tips.json');
const port = process.env.PORT || 9000;
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });


http.createServer(function (req, res) {
	console.log(`${req.method} ${req.url}`);

	const pathname = '/index.html';
	fs.readFile(pathname, function (err, data) {
		res.end(data);
	});
}).listen(parseInt(port));

console.log(`Server listening on port ${port}`);


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	// client.channels.cache.get('865252270009352243').send('Ready to serve.');

	runJob();
});

// https://daily.heroeswm.ru/help/

const runJob = () => {
	const tip = tips[Math.floor(Math.random()*tips.length)];
		const channel = client.channels.cache.find(channel => channel.name.toLowerCase() === 'общий-чат');
		channel.send(`${tip.title}\n${tip.content}`);

		tip?.links.forEach(link => {
			const embed = new MessageEmbed()
				.setTitle(link.title)
				.setColor(0xff0000)
				.setDescription(link.description);
			channel.send(embed);
		});
	setTimeout(() => {
		runJob();
	}, 86_400_000 / 4); // four times per day
}

client.on('message', message => {
	if (message.content === '!tip') {
		const tip = tips[Math.floor(Math.random()*tips.length)];
		const channel = client.channels.cache.find(channel => channel.name.toLowerCase() === 'test');
		channel.send(`${tip.title}\n${tip.content}`);

		tip?.links.forEach(link => {
			const embed = new MessageEmbed()
				.setTitle(link.title)
				.setColor(0xff0000)
				.setDescription(link.description);
			channel.send(embed);
		});
	}
});

client.login(process.env.BOT_TOKEN);