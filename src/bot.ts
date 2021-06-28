"use strict";

require('dotenv').config();

const axios = require('axios').default;
const instance = axios.create();
instance.defaults.timeout = 2500;

import { getBookInfo } from "./books";

function sendHelpCommands(msg: any){
  let commands = "ping -> pong! \n !libro -> Dame un ISBN y traeré la referencia APA de ese libro (dependiendo de la información que encuentre) \n !pelicula -> Buscaré información y trailer de la película que me digas, como '!pelicula godzilla' \n !trailer -> Buscaré trailer de la película que me digas como '!trailer twilight' \n Toma en cuenta que estoy chiquito :pensive: y puedo cometer errores medio sonsos :pleading_face:";
  const embeded = new Discord.MessageEmbed()
    .setTitle("Comandos disponibles")
    .setDescription(commands)
    .setFooter("Sugerencias en issues de https://github.com/fanyCaz/apa-bot");
  msg.channel.send(embeded);
}

/*MOVIE*/
async function sendTrailerInfo(movie_id: string, msg: any){
  let response: any = await instance.get('https://imdb-api.com/en/API/Trailer/',{
    params: {
      apiKey: process.env.API_KEY,
      id: movie_id
    }
  }).then(function(res: any){
     return res;
  }).catch(function(error: any){
     return error;
  });

  if(response.status == 200 && response.data.errorMessage == ''){
    let trailer_info = response.data;
    let description: string = (trailer_info.linkEmbed) ? `Si no te funciona el título, usa este: ${trailer_info.linkEmbed}` : ``;
    const embeded = new Discord.MessageEmbed()
      .setTitle(`Trailer: ${trailer_info.fullTitle}`)
      .setDescription(description)
      .setURL(trailer_info.link);
    msg.channel.send(embeded);
  }else{
    msg.reply("No se ha encontrado un trailer :hole:");
  }
}

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

async function sendMovieInfo(movie_id: string, msg: any){
  let title_info: any = await getTitleInfo(movie_id);
  if(title_info != 500){
    const embeded = new Discord.MessageEmbed()
      .setTitle(title_info.fullTitle)
      .setDescription(`**Plot**: ${title_info.plot} **Dirige** ${title_info.directors}`)
      .setImage(title_info.image)
      .setFooter(`Duración: ${title_info.runtimeStr} Reparto: ${title_info.stars}`);
      msg.channel.send(embeded);
    sendTrailerInfo(movie_id, msg);
  }else{
    msg.reply("No se ha encontrado :confused:")
  }
}

async function getMovieInfo(expression: string, msg: any, type_request: string){
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
  if(response.status != 200 || response == undefined){
    msg.reply("mmmm puede que el servicio de IMDB esté down :frowning:");
    return;
  }
  if(response.data.results){
    let movie_id: string = response.data.results[0].id;
    switch(type_request){
      case 'movie':
        sendMovieInfo(movie_id, msg);
        break;
      case 'trailer':
        sendTrailerInfo(movie_id, msg);
        break;
    }
  }else{
     msg.reply("Hubo un error :skull:");
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
  if(msg.author.bot){
    return;
  }
  /*LOS COMANDOS DEBEN EMPEZAR CON '!' PARA NO CONFUNDIR CON MSG NORMAL DEL CHAT, O HACER QUE SOLO RESPONDA EN UN CHANNEL ESPECÍFICO*/
  let args: string[] = message.split(' ');
  let command = args.shift();
  switch(command){
    case 'ping':
      msg.reply('pong');
      break;
    case '!libro':
      if(args[0] != null){
        //replace the '-' with no space
        let isbn: string = args[0].replace(/-/gi,'');
        if(isbn.length == 13 || isbn.length == 10){
          msg.reply("Dame unos segundos para buscar uwu");
          getBookInfo(isbn, msg);
        }else{
          msg.reply("Pasa un isbn porfavor :upside_down_face:");
        }
      }
      break;
    case '!pelicula':
      let exp: string = args.join(' ');
      if(exp.length > 1){
        msg.reply("Dame unos segundos para buscar uwu");
        getMovieInfo(exp, msg, 'movie');
      }else{
        msg.reply("Pasa el nombre de una película :upside_down_face:");
      }
      break;
    case '!trailer':
      let expression = args.join(' ');
      if(expression.length > 1){
        msg.reply("Dame unos segundos para buscar uwu");
        getMovieInfo(expression, msg, 'trailer');
      }else{
        msg.reply("Pasa el nombre de una película :upside_down_face:");
      }
      break;
    case '!ayuda':
    case '!help':
      sendHelpCommands(msg);
      break;
  }
});

client.login(process.env.TOKEN);
