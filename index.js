const Discord = require("discord.js");
const config = require("./config.json");
const fetch = require('node-fetch');

const client = new Discord.Client();


client.on("ready", () => {
	console.log(`Disguise Event Bot has been started.`);
});

client.on("error", () => {
	console.log(`Error: ${error}`);
});

var quizCounter = 0;
var SendAnswer = "";
var answer = "";
var run = 0;

async function Disguise(channelID) {
	quizCounter++;
	if (quizCounter > config.max) {
		client.channels.get(channelID).send(`_**Okay that the last disguise quiz, thanks for participating in the event.**_`);
		quizCounter = 0;
		return;
	}
	let mob_id;
	switch (config.mode) {
		default:
			console.log(`Config: invalid config [mode], 0: all mob except blacklist, 1: MvP mob only`);
			return;
		case 1:
			mob_id = config.mvp[Math.floor(Math.random() * config.mvp.length)];
			break;
		case 0:
			do {
				mob_id = Math.floor((Math.random() * 995) + 1001);
			}
			while (config.blacklist.indexOf(mob_id) > -1);
			break;
	}
	
	let data = Math.floor(Math.random() * config.question.length);
	let response = await fetch(`https://www.divine-pride.net/api/database/Monster/${mob_id}?apiKey=${config.apikey}`, 
	{ 
		method: 'GET', 
	});
	let json = await response.json();
	switch (data) {
		case 0: answer = json.name; break;
		//case 1: 
		//	answer = config.element[json.element];
		//	break;
		case 1: 
			answer = config.race[json.stats.race];
			break;
		case 2:
			answer = config.size[json.stats.scale];
			break;
	}
	let type = config.question[data];
	
	client.channels.get(channelID).send({embed: {
			color: config.color[data],
			title: `Guess No. ${quizCounter}! What is _**[${type}]**_ of the mob below?`,
			image: {
				"url": `http://file5.ratemyserver.net/mobs/${mob_id}.gif`
			},
		}
	});
	
	SendAnswer = setTimeout(function() { 
		client.channels.get(channelID).send(`_**Okay you are all slow, the answer is: [${answer}]**_`);
		answer = "";
		Disguise(channelID); 
	}, config.timeout);
	return;
}

client.on("message", async message => {

	if(message.author.bot) return;
	if (answer !== "") {
		let answer2 = answer.toLowerCase();
		if (message.content.toLowerCase() === answer2) {
			message.channel.send(`${message.author.username} is right, the answer is ${answer}`);
			answer = "";
			clearTimeout(SendAnswer);
			Disguise(message.channel.id);	
		}
	}
	if(message.content.indexOf(config.prefix) !== 0) return;
	
	let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	let command = args.shift().toLowerCase();
		
	if(command === "start") {
		if(message.author.id.indexOf(config.WhiteList) > -1) {
			if (run === 1) {
				console.log(`Disguise is on going...`);
				message.channel.send(`Disguise is on going....`);
			} else {
				run = 1;
				Disguise(message.channel.id);
			}
		}
	}
	if(command === "stop") {
		if(message.author.id.indexOf(config.WhiteList) > -1) {
			if (run === 0) {
				console.log(`Disguise is not running...`);
				message.channel.send(`Disguise is not running....`);
			} else {
				message.channel.send(`Disguise is stopped by staff....`);
				clearTimeout(SendAnswer);
				answer = "";
				run = 0;
				quizCounter = 0;
			}
		}
	}
});

client.login(config.token);
