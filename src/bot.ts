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
      var nombrePelicula=args.join(' ');
      if(nombrePelicula.length>1){
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
      if(nombrePelicula.length>1){
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
