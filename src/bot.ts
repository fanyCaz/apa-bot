"use strict";

require('dotenv').config();

const axios = require('axios').default;

const Discord = require('discord.js');
const client = new Discord.Client();

let apaReply = function(response:any): string{
	let authors:string = (response["authors"]) ? response["authors"] : "xxx";
	let yearPublished:string = (response["publish_date"]) ? response["publish_date"].slice(-4) : "xxx";
	let title:string = (response["title"]) ? response["title"] : "xxx";
	let publisher:string = (response["publishers"]) ? response["publishers"][0] : "xxx";
	let reply:string = `${authors}.(${yearPublished}).${title}.${publisher}`;
	return reply;
}

/*REQUEST TO OPEN LIBRARY*/
async function getBookInfo(isbn:string, msg:any){
	let openLibraryURL: string = "https://openlibrary.org/isbn/";
	let reply:any = await axios.get(openLibraryURL+isbn+".json")
		.then(function(response){
			console.log(response.data);
			return response;
		})
		.catch(function(error){
			console.log(error);
			return error;
		});

	if(reply.status == 200){
		let citation:string = apaReply(reply);
		msg.reply(citation);
	}else{
		msg.reply("No se ha encontrado el libro :c");
	}
};

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg =>{
	let message: string = msg.content;
	let channelID:any = msg.channel.id;

	let command:string = message.split(' ')[0];
	let args:string[] = message.split(' ');
	switch(command){
		case 'ping':
			msg.reply('pong');
			break;
		case 'getbook':
			if(args.length > 1 ){
				if(args[1].length == 10 || args[1].length == 13){
					let isbn:string = args[1];
					getBookInfo(isbn,msg);
				}
			}else{
				msg.reply("Pasa un isbn porfavor :upside_down_face:");
			}
			break;
	};
});

client.login(process.env.TOKEN);