"use strict";

require('dotenv').config();

const axios = require('axios').default;
const instance = axios.create();
instance.defaults.timeout = 2500;

import { validISBN, getBookInfo } from "./books";
import { searchMovie, searchTrailer } from "./movies";
import { addMovie, movieList, deleteMovie, selectMovie } from './randomizer';

function sendHelpCommands(msg: any){
  let commands = "!ping -> pong! \n " +
    "!libro -> Dame un ISBN y traeré la referencia APA de ese libro (dependiendo de la información que encuentre) \n" +
    "!pelicula -> Buscaré información y trailer de la película que me digas, como '!pelicula godzilla' \n" +
    "!lista -> Mostraré todas las películas que tengas agregadas para ver después \n" +
    "!sugerir -> Agregaré la película que escribas a la lista, escríbela como '!sugerir Buscando a Nemo' \n" +
    "!elegir -> Seleccionaré una película al azar y te diré el nombre \n" +
    "!eliminar -> Eliminaré la película de la lista \n" +
    "Toma en cuenta que estoy chiquito :pensive: y puedo cometer errores medio sonsos :pleading_face:";
  const embeded = new Discord.MessageEmbed()
    .setTitle("Comandos disponibles")
    .setDescription(commands)
    .setFooter("Sugerencias en issues de https://github.com/fanyCaz/apa-bot");
  // Do NOT move from this position
  msg.channel.send(`\`\`\`yaml
  ╱╱╭╮╱╭╮╱╱╱╱╱╱╱╱╭╮╱╱╱╱╱╱╱╱╱╱╱╱╱╱╭╮╭╮╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╭╮╱╱╱╱╭╮╱╭╮╱╭╮
  ╱╱┃┃╱┃┃╱╱╱╱╱╱╱╱┃┃╱╱╱╱╱╱╱╱╱╱╱╱╱╭╯╰┫┃╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱┃┃╱╱╱╭╯╰╮┃┃╱┃┃
  ╭━╯┣━╯┃╭╮╭╮╭┳━━┫┃╭━━┳━━┳╮╭┳━━╮╰╮╭┫╰━┳━━╮╭━━┳━━┳━━╮╱╱┃╰━┳━┻╮╭╯┃╰━┫╰━╮
  ┃╭╮┃╭╮┃┃╰╯╰╯┃┃━┫┃┃╭━┫╭╮┃╰╯┃┃━┫╱┃┃┃╭╮┃┃━┫┃╭╮┃╭╮┃╭╮┣━━┫╭╮┃╭╮┃┃╱┃╭╮┃╭╮┃
  ┃╰╯┃╰╯┃╰╮╭╮╭┫┃━┫╰┫╰━┫╰╯┃┃┃┃┃━┫╱┃╰┫┃┃┃┃━┫┃╭╮┃╰╯┃╭╮┣━━┫╰╯┃╰╯┃╰╮┃╰╯┃╰╯┃
  ╰━━┻━━╯╱╰╯╰╯╰━━┻━┻━━┻━━┻┻┻┻━━╯╱╰━┻╯╰┻━━╯╰╯╰┫╭━┻╯╰╯╱╱╰━━┻━━┻━╯╰━━┻━━╯
  ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱┃┃
  ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╰╯
                    \`\`\`    `);
  msg.channel.send(embeded);
}

console.log("======= WARNING ======= ");
console.log("Toma en cuenta que se está utilizando Nodemon, el cual refresca el servidor cada vez que hay cambios en los archivos.\n POR LO TANTO cada vez que sugieras o elimines una película, se guardarán los cambios en 'movies.json', lo que ocasionará que NODEMON actúe.");

function isValidArgument(argument: string[]){
  if(argument.length > 0){
    return true;
  }
  return false;
}

/*DISCORD*/
const Discord = require('discord.js');
const client = new Discord.Client();
// guild means -> server

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
  let expresion;
  
  switch(command){
    case '!ping':
      msg.reply('pong');
      break;
    case '!mina':
      msg.reply('ya dejame ir con el gatooooo');
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
      if(isValidArgument(args)){
        let movie_query: string = args.join(' ');
        msg.reply("Dame unos segundos para buscar uwu");
        searchMovie(movie_query, msg);
      }else{
        msg.reply("Pasa el nombre de una película :upside_down_face:");
      }
      break;
    case '!trailer':
      if(isValidArgument(args)){
        let expression = args.join(' ');
        msg.reply("Dame unos segundos para buscar uwu");
        searchTrailer(expression, msg);
      }else{
        msg.reply("Pasa el nombre de una película :upside_down_face:");
      }
      break;
    /*** RANDOMIZER ***/
    case '!sugerir':
      if(isValidArgument(args)) {
        expresion = args.join(' ');
        addMovie(expresion, msg);
      } else {
        msg.reply("Escribe una película para sugerir :confused:");
      }
      break;
    case '!lista':
      movieList(msg);
      break;
    case '!eliminar':
      if(isValidArgument(args)) {
        expresion = args.join(' ');
        deleteMovie(expresion, msg);
      } else {
        msg.reply("Escribe una película para eliminar :confused:");
      }
      break;
    case '!elegir':
      selectMovie(msg);
      break;
    /*** END RANDOMIZER***/
    case '!ayuda':
    case '!help':
      sendHelpCommands(msg);
      break;
  }
});

client.login(process.env.TOKEN);
