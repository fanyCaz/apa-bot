"use strict";

require('dotenv').config();

const axios = require('axios').default;
const instance = axios.create();
instance.defaults.timeout = 2500;

import { validISBN, getBookInfo } from "./books";
import { searchMovie } from "./movies";

function sendHelpCommands(msg: any){
  let commands = "ping -> pong! \n " +
    "!libro -> Dame un ISBN y traeré la referencia APA de ese libro (dependiendo de la información que encuentre) \n" +
    "!pelicula -> Buscaré información y trailer de la película que me digas, como '!pelicula godzilla' \n" +
    "!lista -> Mostraré todas las películas que tengas agregadas para ver después \n" +
    "!sugerir -> Agregaré la película que escribas a la lista, escríbela como '!sugerir Buscando a Nemo' \n" +
    "!elegir -> Seleccionaré una película al azar y te diré el nombre \n" +
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
  ":film_projector:"
];

const fs=require('fs');
const archivo=(__dirname+"/../movies.json"); // Ruta global para el archivo
const data={
  example:{
    id:1,
    url:"trailer-string"
  }
}
console.log("======= WARNING ======= ");
console.log("Toma en cuenta que se está utilizando Nodemon, el cual refresca el servidor cada vez que hay cambios en los archivos.\n POR LO TANTO cada vez que sugieras o elimines una película, se guardarán los cambios en 'movies.json', lo que ocasionará que NODEMON actúe.");

let existe=fs.existsSync(archivo);
if(!existe){
  // Indicar nombre y ejemplo de formato
  fs.writeFile ("movies.json", JSON.stringify(data), function(){
    console.log('Completado');
    return;
  });
}

function listMovieOptions(msg:any){
  /* 06/07/2021 */
  /* Mood del día: Donkey Kong Country 2 Soundtrack */
  fs.readFile(archivo, 'utf8', function readFileCallback(err:any, data:any){
    if(err){
      msg.reply("Oh oh, parece que hubo un problema :confounded:");
    } else{
      const moviesJsonKeys:any = Object.keys(JSON.parse(data));
      if(moviesJsonKeys.length==0){
        msg.reply("No hay ninguna película en la lista. Agrega una con '!sugerir' :slight_smile:");
      } else{
        const embeded = new Discord.MessageEmbed()
        .setTitle("Lista de peliculas:")
        .setDescription(`${moviesJsonKeys}`)
        .setFooter("===============================================================");
        msg.channel.send(embeded);
      }
    }
  });
}

function addMovieOptions(nombrePelicula:string,msg:any){
  let randomEmoji = emojis[Math.floor(Math.random()*emojis.length)];
  fs.readFile(archivo, 'utf8', function readFileCallback(err:any, data:any){
    if (err){
      msg.reply("Oh oh, parece que hubo un problema :confounded:");
      console.log(err);
    } else {
      const moviesJsonKeys:any = Object.keys(JSON.parse(data));
      const jsonData:any = JSON.parse(data);
      if(jsonData.hasOwnProperty(nombrePelicula)){
        msg.reply(`La película '${nombrePelicula}' ya existe en la lista :slight_smile:`);
      } else{
        let moviesJson:any = JSON.stringify([JSON.parse(data)]);
        // Eliminar [] and {} para concatenar la nueva pelicula
        moviesJson=(moviesJson.replace('[{','').replace('}]',''));
        (moviesJsonKeys.length==0) ? moviesJson=("{"+`"${nombrePelicula}":{"id":2,"url":"Una URL"}`+"}") : moviesJson=("{"+moviesJson+`,"${nombrePelicula}":{"id":2,"url":"Una URL"}`+"}");
        fs.writeFile(archivo, moviesJson, function(err:any){
          if(err){
            console.log(err);
            msg.reply("Oh oh, parece que hubo un problema :confounded:");
          } else{
            msg.reply(`Se agregó '${nombrePelicula}' a la lista! ${randomEmoji}`);
          }
        });
      }
  }});
}

function randomizeMovieOptions(msg:any){
  fs.readFile(archivo, 'utf8', function readFileCallback(err:any, data:any){
    if(err){
      msg.reply("Oh oh, parece que hubo un problema :confounded:");
      console.log(err);
    } else{
      const moviesJsonKeys:any = Object.keys(JSON.parse(data));
      if(moviesJsonKeys.length==0){
        msg.reply("No hay ninguna película en la lista. Agrega una con '!sugerir' :slight_smile:");
      } else{
        let randomMovie = moviesJsonKeys[Math.floor(Math.random()*moviesJsonKeys.length)];
        let randomEmoji = emojis[Math.floor(Math.random()*emojis.length)];
        const embeded = new Discord.MessageEmbed()
          .setTitle("The randomizer! :sunglasses:")
          .setDescription(`La película aleatoria es '${randomMovie}' ${randomEmoji}`)
          .setFooter("====~(8:>====~(8:>====~(8:>====~(8:>====~(8:>====~(8:>====~(8:>====");
          // Do NOT move from this position
          msg.channel.send(`\`\`\`yaml
    <>====================<>====================<>====================<>
    ||/////////||..~(8:>..||/////////||..~(8:>..||/////////||..~(8:>..||
    ||<> <> <> <> <> <> <>||<> <> <> <> <> <> <>||<> <> <> <> <> <> <>||
    ||..~(8:>..||/////////||..~(8:>..||/////////||..~(8:>..||/////////||
    ▀▀█▀▀ █░░█ ▒█▀▀▀ 　 █▀▀█ █▀▀█ █▀▀▄ ▒█▀▀▄ █▀▀█ █▀▄▀█ ▀█▀ ▒█▀▀▀█ █▀▀█
    ░░█░░ █▀▀█ ▒█▀▀▀ 　 █▄▄▀ █▄▄█ █░░█ ▒█░▒█ █░░█ █░▀░█ ▒█░ ░▄▄▄▀▀ █▄▄▀
    ░░▀░░ ▀░░▀ ▒█▄▄▄ 　 ▀░▀▀ ▀░░▀ ▀░░▀ ▒█▄▄▀ ▀▀▀▀ ▀░░░▀ ▄█▄ ▒█▄▄▄█ ▀░▀▀
    ||/////////||..~(8:>..||/////////||..~(8:>..||/////////||..~(8:>..||
    ||<> <> <> <> <> <> <>||<> <> <> <> <> <> <>||<> <> <> <> <> <> <>||
    ||..~(8:>..||/////////||..~(8:>..||/////////||..~(8:>..||/////////||
    <>====================<>====================<>====================<>
          \`\`\``);
          msg.channel.send(embeded);
      }
    }
  });
}

function deleteMovieOption(nombrePelicula:string,msg:any){
  fs.readFile(archivo, 'utf8', function readFileCallback(err:any, data:any){
    if(err){
      msg.reply("Oh oh, parece que hubo un problema :confounded:");
      console.log(err);
    } else{
      const moviesJson:any = JSON.parse(data);
      if(moviesJson.hasOwnProperty(nombrePelicula)){
        delete moviesJson[nombrePelicula]; // Eliminar del objeto
        var json = JSON.stringify([moviesJson]);
        json=(json.replace('[','').replace(']',''));
        fs.writeFile(archivo, json, function(err:any){
          if(err){
            msg.reply("Oh oh, parece que hubo un problema :confounded:");
            console.log(err);
          } else{
            msg.reply(`Se eliminó '${nombrePelicula}' de la lista! :heavy_multiplication_x:`);
          }
        });
      } else{
        msg.reply(`La película '${nombrePelicula}' no se encuentra en la lista :confused:`);
      }
    }
  });
}

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
  
  switch(command){
    case '!ping':
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
      if(isValidArgument(args)){
        let movie_query: string = args.join(' ');
        msg.reply("Dame unos segundos para buscar uwu");
        searchMovie(movie_query, msg);
      }else{
        msg.reply("Pasa el nombre de una película :upside_down_face:");
      }
      break;
    case '!trailer':
      /*if(isValidArgument(args)){
        let expression = args.join(' ');
        msg.reply("Dame unos segundos para buscar uwu");
        //searchTrailer(expression, msg);
      }else{
        msg.reply("Pasa el nombre de una película :upside_down_face:");
      }*/
      msg.reply("Estoy en manteniemto :tools:");
      break;
    case '!sugerir':
      if(isValidArgument(args)){
        var nombrePelicula=args.join(' ');
        addMovieOptions(nombrePelicula,msg);
      } else{
        msg.reply("Debes indicar un nombre válido para añadirlo.");
      }
      break;
    case '!lista':
        listMovieOptions(msg);
      break;
    case '!eliminar':
      var nombrePelicula=args.join(' ');
      if(isValidArgument(args)){
        deleteMovieOption(nombrePelicula,msg);
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
