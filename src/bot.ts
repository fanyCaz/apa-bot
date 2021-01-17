"use strict";

require('dotenv').config();

const axios = require('axios').default;

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg =>{
	let message: string = msg.content;
	if(message == 'ping'){
		msg.reply('pong');
	}
	else if(message == 'marco' || message == 'Marco'){
		msg.reply('Polooo');
	}
});

client.login(process.env.TOKEN);

console.log( process.env.TOKEN );