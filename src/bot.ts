"use strict";

require('dotenv').config();

const axios = require('axios').default;

const Discord = require('discord.js');
const client = new Discord.Client();

let apaReply = function(response:any): string{
	let authors:string = "not yet";
	let yearPublished:string = response["publish_date"].slice(-4);
	let title:string = response["title"];
	let publisher:string = response["publishers"][0];
	let reply:string = `${authors}.(${yearPublished}).${title}.${publisher}`;
	return reply;
}

/*REQUEST TO OPEN LIBRARY*/
async function getBookInfo(isbn:string, msg:any){
	let openLibraryURL: string = "https://openlibrary.org/isbn/";
	let reply:any = await axios.get(openLibraryURL+isbn+".json")
		.then(function(response){
			console.log(response.data);
			return response.data;
		})
		.catch(function(error){
			console.log(error);
			return "No he podido obtener el libro :tired_face:";
		});


	let citation:string = apaReply(reply);
	msg.reply(citation);
};

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
		let isbn: string = "9780140328721";
		getBookInfo(isbn,msg);
	}
});

client.login(process.env.TOKEN);