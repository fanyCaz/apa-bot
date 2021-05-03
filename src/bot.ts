"use strict";

require('dotenv').config();

const axios = require('axios').default;

/*MAKE A MESSAGE*/
function apaReply(response: any, author: string): string{
	let year_published: string = (response["publish_date"]) ? response["publish_date"].slice(-4) : "xxx";
	let title: string = (response["title"]) ? response["title"] : "xxx";
	let publisher: string = (response["publishers"]) ? response["publishers"][0] : "xxx";
	return `${author}(${year_published}).*${title}*.${publisher}`;
}

/*BOOK*/
async function getAuthorInfo(author_key: string){
	let openLibraryURL: string = "https://openlibrary.org/authors/";
	let response: any = await axios.get(`${openLibraryURL}${author_key}.json`)
						.then(function(res:any){
							return res;
						})
						.catch(function(error: any){
							return error;
						});
	if(response.status == 200){
		return response.data["personal_name"];
	}else{
		"xxx";
	}
}

async function getBookInfo(isbn:string, msg: any){ 
	let openLibraryURL: string = "https://openlibrary.org/isbn/";
	let response: any = await axios.get(`${openLibraryURL}${isbn}.json`)
											.then(function(res: any){
												return res;
											})
											.catch(function(error: any){
												return error;
											});
	if(response.status == 200){
		let author: string = "xxx";
		if(response.data["authors"]){
			let author_id: string = response.data["authors"][0].key.split('/')[2];
			author = await getAuthorInfo(author_id);
		}
		let reference: string = apaReply(response.data, author);
		msg.reply(reference);
	}else{
		msg.reply("No fue encontrado :confused:");
	}
}

/*DISCORD*/
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () =>{
    console.log(`logged in ${client.user.tag}`);
});

client.on('message', (msg: any) =>{
    let message: string = msg.content;

		let command: string = message.split(' ')[0];
		let args = message.split(' ');
		switch(command){
			case 'ping':
				msg.reply('pong');
				break;
			case 'libro':
			  if(args[1] != null){
			 	  let isbn: string = args[1];
					if(isbn.length == 13 || isbn.length == 10){
						getBookInfo(isbn, msg);
					}else{
						msg.reply("Pasa un isbn porfavor :upside_down_face:")
					}
				}
			break;
		}
});

client.login(process.env.TOKEN);