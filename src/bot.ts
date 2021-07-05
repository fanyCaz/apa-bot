"use strict";

require('dotenv').config();

const axios = require('axios').default;
const instance = axios.create();
instance.defaults.timeout = 2500;

import { validISBN, getBookInfo } from "./books";

function sendHelpCommands(msg: any){
  let commands = "ping -> pong! \n !libro -> Dame un ISBN y traeré la referencia APA de ese libro (dependiendo de la información que encuentre) \n !pelicula -> Buscaré información y trailer de la película que me digas, como '!pelicula godzilla' \n !trailer -> Buscaré trailer de la película que me digas como '!trailer twilight' \n !lista -> Mostraré todas las películas que tengas agregadas para ver después \n !sugerir -> Agregaré la película que escribas a la lista, escríbela como '!sugerir Buscando a Nemo' \n !elegir -> Seleccionaré una película al azar y te diré el nombre \n Toma en cuenta que estoy chiquito :pensive: y puedo cometer errores medio sonsos :pleading_face:";
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

/* YO MERO */
// Set rudimentario para almacenar películas en la sesión del servidor actual (se dice así? lol)
// Cada vez que se reinicia el server las opciones desaparecen
const set=new Set();
const emojis=[
  ":cow:",
  ":cowboy:",
  ":cow2:",
  ":slight_smile:",
  ":popcorn:",
  ":chocolate_bar:",
  ":candy:",
  ":movie_camera:",
  ":film_frames:",
  ":projector:",
  ":film_projector"
];

function listMovieOptions(msg:any){
  // Creo que esto se llama 'Object destructuring'. Basicamente nos permite "sacar" los valores del set que creamos antes y asi poder leerlos
  const movies=[...set];
  if(movies.length==0){
    msg.reply("No hay ninguna película en la lista. Agrega una con !sugerir :slight_smile:");
  } else{
    const embeded = new Discord.MessageEmbed()
    .setTitle("Lista de peliculas:")
    .setDescription(`${movies}`)
    .setFooter("===============================================================");
    msg.channel.send(embeded);
  }
}
function addMovieOptions(expresion:string,msg:any){
  var randomEmoji = emojis[Math.floor(Math.random()*emojis.length)];
  set.add(expresion);
  msg.reply(`Se agregó "${expresion}" a la lista! ${randomEmoji}`);
}

function randomizeMovieOptions(msg:any){
  // Creo que esto se llama 'Object destructuring'. Basicamente nos permite "sacar" los valores del set que creamos antes y asi poder leerlos
  const movies=[...set];
  if(movies.length>0){
  var randomMovie = movies[Math.floor(Math.random()*movies.length)];
  var randomEmoji = emojis[Math.floor(Math.random()*emojis.length)];
  const embeded = new Discord.MessageEmbed()
    .setTitle("The randomizr! :sunglasses:")
    .setDescription(`La película aleatoria es "${randomMovie}" ${randomEmoji}`)
    .setFooter("===============================================================");
    msg.channel.send(embeded);
  } else{
    msg.reply("No hay ninguna película en la lista. Agrega una con !sugerir :slight_smile:");
  }
}

function deleteMovieOption(nombre:string,msg:any){
  if(set.has(nombre)){
    // La pelicula SI existe
    set.delete(nombre);
    msg.reply(`'${nombre}' se ha eliminado de la lista.`);
  } else{
    msg.reply("La película no se encuentra en la lista.");
  }
}

/*DISCORD*/
const Discord = require('discord.js');
const client = new Discord.Client();
// guild -> server

client.on('ready', () =>{
  console.log(`logged in ${client.user.tag}`);
});

client.on('message', (msg: any) =>{
  let message: string = msg.content;
  if(msg.author.bot){
    return;
  }
  /*LOS COMANDOS DEBEN EMPEZAR CON '!' PARA NO CONFUNDIR CON MSG NORMAL DEL CHAT, O HACER QUE SOLO RESPONDA EN UN CHANNEL ESPECÍFICO*/
  let args: string[] = message.trim().split(/ +/);
  let command = args.shift();
  
  switch(command){
    case 'ping':
      msg.reply('pong');
      break;
    case '!libro':
      if(validISBN(args[0])){
        //replace the '-' with no space
        let isbn: string = args[0].replace(/-/gi,'');
        msg.reply("Dame unos segundos para buscar uwu");
        getBookInfo(isbn, msg);
      }else{
        msg.reply("Pasa un isbn porfavor :upside_down_face:");
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
    case '!sugerir':
      let expresion=args.join(' ');
      if(expresion.length>1){
        addMovieOptions(expresion,msg);
      } else{
        msg.reply("Debes indicar un nombre válido para añadirlo.");
      }
      break;
    case '!lista':
        listMovieOptions(msg);
      break;
    case '!eliminar':
      let nombre=args.join(' ');
      if(nombre.length>1){
        deleteMovieOption(nombre,msg);
      } else{
        msg.reply("Debes indicar un nombre válido para la película que quieres eliminar :upside_down_face:");
      }
    break;
    case '!elegir':
        randomizeMovieOptions(msg);
      break;
    case '!ayuda':
    case '!help':
      sendHelpCommands(msg);
      break;
  }
});

client.login(process.env.TOKEN);
