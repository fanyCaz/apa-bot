"use strict";

require('dotenv').config();

const axios = require('axios').default;
const instance = axios.create();
instance.defaults.timeout = 2500;

/*MAKE A MESSAGE*/
function apaReply(response: any, author: string): string{
  let year_published: string = (response["publish_date"]) ? response["publish_date"].slice(-4) : "xxx";
  let title: string = (response["title"]) ? response["title"] : "xxx";
  let publisher: string = (response["publishers"]) ? response["publishers"][0] : "xxx";
  return `${author}(${year_published}).*${title}*.${publisher}`;
}

/*MOVIE*/
async function getTitleInfo(movie_id: string){
  let response: any = await axios.get('https://imdb-api.com/en/API/Title/',{
    params: {
		  apiKey: process.env.API_KEY,
      id: movie_id
		}
		}).then(function(res: any){
		  return res;
		}).catch(function(error: any){
		  return error;
		});

  if(response.status == 200){
	  return response.data;
  }
	return 500;
}

async function getMovieInfo(expression: string, msg: any){
	let response: any = await axios.get('https://imdb-api.com/en/API/SearchMovie/',{
    params:{
      apiKey: process.env.API_KEY,
      expression: expression
    }
    }).then(function(res: any){
      return res;
    }).catch(function(error: any){
      return error;
    });
	console.log(response.status);
	if(response.status != 200 || response == undefined){
	 msg.reply("mmmm puede que el servicio de IMDB esté down :frowning:");
	 return;
	}
	if(response.data.errorMessage == ""){
	  if(response.data.results){
		  let movie_id: string = response.data.results[0].id;
		  let title_info: any = await getTitleInfo(movie_id);
			if(title_info != 500){
			  const embeded = new Discord.MessageEmbed()
				.setTitle(title_info.fullTitle)
				.setDescription(`**Plot**: ${title_info.plot} **Dirige** ${title_info.directors}`)
        .setImage(title_info.image)
				.setFooter(`Duración: ${title_info.runtimeStr} Reparto: ${title_info.stars}`);
				msg.channel.send(embeded);
			}else{
			  msg.reply("No se ha encontrado :confused:")
			}
		}else{
		  msg.reply("Hubo un error, pls stand by :skull:");
		}
	}
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
  let response: any = await instance.get(`${openLibraryURL}${isbn}.json`)
                      .then(function(res: any){
                        return res;
                      })
                      .catch(function(error: any){
                        console.log("error")
                        console.log(error);
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
  }else if(response.code == "ECONNABORTED"){
    msg.reply("Puede que el servicio de OpenLibrary se haya caído, confiemos que se repondrá :pray:");
  } else{
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
		/*LOS COMANDOS DEBEN EMPEZAR CON '!' PARA NO CONFUNDIR CON MSG NORMAL DEL CHAT, O HACER QUE SOLO RESPONDA EN UN CHANNEL ESPECÍFICO*/
    let args: string[] = message.split(' ');
    let command = args.shift();
    switch(command){
      case 'ping':
        msg.reply('pong');
      break;
      case '!libro':
        if(args[0] != null){
          let isbn: string = args[0];
          if(isbn.length == 13 || isbn.length == 10){
            msg.reply("Dame unos segundos para buscar uwu");
            getBookInfo(isbn, msg);
          }else{
            msg.reply("Pasa un isbn porfavor :upside_down_face:")
          }
        }
      break;
      case '!pelicula':
        let exp: string = args.join(' ');
        if(exp.length > 1){
				  msg.reply("Dame unos segundos para buscar uwu");
					getMovieInfo(exp, msg);
			  }else{
          msg.reply("Pasa el nombre de una película :upside_down_face:");
				}
      break;
    }
});

client.login(process.env.TOKEN);
