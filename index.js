const { Client, Intents, MessageEmbed } = require('discord.js');
const http = require('http');
const fs = require('fs');
const https = require('https')
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
	runJob();
});

// https://daily.heroeswm.ru/help/

const runJob = () => {
	const tip = tips[Math.floor(Math.random() * tips.length)];
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
		const tip = tips[Math.floor(Math.random() * tips.length)];
		const channel = client.channels.cache.find(channel => channel.name.toLowerCase() === 'test');
		channel.send(`${tip.title}\n${tip.content}`);

		tip?.links.forEach(link => {
			const embed = new MessageEmbed()
				.setTitle(link.title)
				.setColor(0xff0000)
				.setDescription(link.description);
			channel.send(embed);
		});
		return;
	}
	if (message.channel.name === 'авторизация' && message.content.startsWith('!authorize')) {
		const userInfo = message.content.replace('!authorize ', '');
		const nameAndLvl = userInfo.split(' ').filter(a => a);
		const name = nameAndLvl[0];
		const lvl = nameAndLvl[1];

		const options = {
			hostname: 'www.heroeswm.ru',
			port: 443,
			path: `/search.php?key=${name}`,
			method: 'GET'
		}

		const req = https.request(options, res => {
			console.log(`statusCode: ${res.statusCode}`)
			if (res.statusCode != 302) {
				message.channel.send(`Игрок с ником ${name} не существует, убедись, что ты ввел правильную информацию`);
				return;
			} else {
				register(message, name, lvl);
			}
		})

		req.on('error', error => {
			console.error(error)
		})

		req.end()
	}
});

function register(message, name, lvl) {
	const guild = client.guilds.cache.find(g => g.name === 'Герои Войны и Денег');
	const playerRole = guild.roles.cache.find(r => r.name === 'Игрок');
	const lvlRole = guild.roles.cache.find(r => r.name === `Уровень: [${lvl}]`);
	message.member.setNickname(name)
		.catch(e => {
			channel.send(`${name} что-то пошло не так, убедись, что ты ввел правильную информацию`);
			console.error(e);
		});
	message.member.roles.add([playerRole, lvlRole])
		.catch(e => {
			console.error(e);
		});
}

client.login(process.env.BOT_TOKEN);