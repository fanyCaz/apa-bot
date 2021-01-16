"use strict";

require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg =>{
	if(msg.content == 'ping'){
		msg.reply('pong');
	}
	else if(msg.content == 'marco' || msg.content == 'Marco'){
		msg.reply('Polooo');
	}
});

client.login(process.env.TOKEN);