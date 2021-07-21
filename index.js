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

process.on('unhandledRejection', error => {
	// Will print "unhandledRejection err is not defined"
	console.error('unhandledRejection', error);
});
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

// greeting
client.on('guildMemberAdd', async member => {
	try {
		const channel = client.channels.cache.find(channel => channel.name.toLowerCase() === 'авторизация');
		channel.send(`${member.displayName} has joined the server`);
		member.send
		channel.send(`Привет ${member}!, чтобы получить полный доступ ко всем каналам, надо на этом канале написать следующее сообщение:
		!authorize nickname lvl
		вместо nickname надо написать название своего персонажа в ГВД, а вместо lvl - уровень персонажа.`);
	} catch (e) {
		console.error(e);
	}
});

client.on('guildMemberRemove', member => {
	const channel = client.channels.cache.find(channel => channel.name.toLowerCase() === 'test');
	channel.send(`${member.displayName} has left the server`);
});

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
		const lvl = userInfo.substr(userInfo.lastIndexOf(' ')+1, userInfo.length);
		const name = userInfo.substr(0, userInfo.lastIndexOf(' ')).trim();

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