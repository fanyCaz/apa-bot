"use strict";

require('dotenv').config();

const axios = require('axios').default;

const Discord = require('discord.js');
const client = new Discord.Client();

async function iterateMovies(movie:any){
	let result:any = await axios.get('https://imdb-api.com/en/API/Title/',{
		params: {
		 apiKey: process.env.API_KEY,
		 Id: movie['id']	
		}
		}).then(function(res){
		  return res['data'];	
		}).catch(function(err){
			return err;		
		});
		console.log(result);
}


/*REQUEST TO IMDB*/
async function getMovieInfo(expression:string){
	let result:any = await axios.get('https://imdb-api.com/en/API/SearchMovie/',{
		params: {
			apiKey: process.env.API_KEY,
			expression: expression 
		}	
	}).then(function(res){
		return res['data'];
	}).catch(function(err){
		return err;
	});
	if(result['results'].length < 1){
		return 'No existe esa película :woman_shrugging:';
	}
	await iterateMovies(result['results'][0])
}

let apaReply = function(response:any, author:string): string{
	let yearPublished:string = (response["publish_date"]) ? response["publish_date"].slice(-4) : "xxx";
	let title:string = (response["title"]) ? response["title"] : "xxx";
	let publisher:string = (response["publishers"]) ? response["publishers"][0] : "xxx";
	let reply:string = `${author}(${yearPublished}).${title}.${publisher}`;
	return reply;
}

/*REQUEST TO OPEN LIBRARY*/
async function getAuthorInfo(authorKey:string){
	let openLibraryURL:string = "https://openlibrary.org/authors/";
	let authorData:any = await axios.get(`${openLibraryURL}${authorKey}.json`)
		.then(function(response){
			return response;
		})
		.catch(function(error){
			return error;
		});
	if(authorData.status == 200){
		return authorData.data["personal_name"];
	}else{
		return "xxx";
	}
}

async function getBookInfo(isbn:string, msg:any){
	let openLibraryURL: string = "https://openlibrary.org/isbn/";
	let reply:any = await axios.get(`${openLibraryURL}${isbn}.json`)
		.then(function(response){
			return response;
		})
		.catch(function(error){
			return error;
		});

	if(reply.status == 200){
		let authorID:string = reply.data["authors"][0].key.split('/')[2];
		let authorName:string = await getAuthorInfo(authorID);
		let citation:string = apaReply(reply.data,authorName);
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
		case 'getmovie':
			if(args.length > 1){
				args.shift();
				let search_expression:string = args.join(' ');
				console.log(search_expression)
				getMovieInfo(search_expression);
			}
	};
});

client.login(process.env.TOKEN);
