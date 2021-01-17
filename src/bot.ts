"use strict";

require('dotenv').config();

const axios = require('axios').default;

const Discord = require('discord.js');
const client = new Discord.Client();

/*REQUEST TO OPEN LIBRARY*/
let getBookInfo:() => any = function(): any {
	let isbn: string = "9780140328721.json";
	let openLibraryURL: string = "https://openlibrary.org/isbn/";
	axios.get(openLibraryURL+isbn)
		.then(function(response){
			console.log(response);
			
		} )
		.catch(function(error){
			console.log(error);
		});
}

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
	else if(message == 'getbook'){
		getBookInfo();
	}
});

client.login(process.env.TOKEN);