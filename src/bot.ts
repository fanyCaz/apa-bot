"use strict";

require('dotenv').config();

const axios = require('axios').default;
const instance = axios.create();
instance.defaults.timeout = 2500;

import { getBookInfo } from "./books";

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

// Crear / verificar existencia del archivo movies.json
// Originalmente iba a crearse la ruta del archivo uniendo el directorio actual y regresando un nivel
// pero por alguna razon el fs.sxistsSync no funcionaba de esta manera porque siempre retornaba falso, por lo que se lo anide como string
// directamente y ahora si me lo evaluaba como debe.
// var fs=require('fs');
// const path=require('path');
const fs=require('fs');
// const archivo=(__dirname+path.join('../movies.json'));
const archivo=(__dirname+"/../movies.json"); // Ruta global para el archivo
const data={
  example:{
    id:1,
    name:"movie-string",
    url:"trailer-string"
  }
}
console.log("======= WARNING ======= ");
console.log("Toma en cuenta que se está utilizando Nodemon, el cual reinicia el servidor cada vez que hay cambios en los archivos.\n POR LO TANTO cada vez que sugieras una película, ésta se agregará al archivo 'movies.json' y guardará los cambios, lo que ocasionará que NODEMON actúe.");
console.log(archivo);
// Revisa si el archivo existe o no
let existe=fs.existsSync(archivo);
if(!existe){ // Si no existe se crea
  // Se indica el nombre del archivo y enviamos un ejemplo de como debería almacenarse cada entrada
  fs.writeFile ("movies.json", JSON.stringify(data), function(){
    console.log('Completado');
    return;
  });
}
// (fileExists) ? console.log("El archivo SI existe.") : console.log(fileExists);

// Usamos este set como apoyo al extraer datos de los JSON
const set=new Set();

function listMovieOptions(msg:any){
  /* 06/07/2021 */
  /* Mood del día: Donkey Kong Country 2 Soundtrack */
  // fs.readFile pues, lee el archivo con el path que indicamos
  fs.readFile(archivo, 'utf8', function readFileCallback(err:any, data:any){
    if(err){
        console.log(err);
    } else{
      // Hagamos un breakdown
      // Se parsean los datos del archivo 'movies.json' donde se almacenan las peliculas
      const moviesJson:any = JSON.parse(data); // El JSON ahora es un objeto
      // Se cicla para obtener el nombre de cada llave existente y almacenarla en el set con el que mostraremos los titulos al cliente
      for(let key in moviesJson) {
          set.add(key);
      }
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
  });
}

function addMovieOptions(expresion:string,msg:any){
  var randomEmoji = emojis[Math.floor(Math.random()*emojis.length)];
  fs.readFile(archivo, 'utf8', function readFileCallback(err:any, data:any){
    if (err){
        console.log(err);
    } else {
      // Parsing
      let moviesJson:any = [JSON.parse(data)];
      // To string
      let moviesString:string = JSON.stringify(moviesJson);
      // Eliminar [] and {} para hacer push de la nueva pelicula
      moviesString=(moviesString.replace('[{','').replace('}]',''));
      moviesJson=[moviesString];
      moviesJson.push(`"${expresion}":{"id":2,"url":"Una URL"}`);
      moviesString=("{"+moviesJson+"}");
      // Escribir en el archivo la nueva informacion
      fs.writeFile(archivo, moviesString, function(err:any){
        console.log(err);
        msg.reply(`Se agregó "${expresion}" a la lista! ${randomEmoji}`);
      });
  }});
}

function randomizeMovieOptions(msg:any){
  fs.readFile(archivo, 'utf8', function readFileCallback(err:any, data:any){
    if(err){
        console.log(err);
    } else{
      const moviesJson:any = JSON.parse(data);
      for(let key in moviesJson) {
          set.add(key);
      }
      const movies=[...set];
      if(movies.length==0){
        msg.reply("No hay ninguna película en la lista. Agrega una con !sugerir :slight_smile:");
      } else{
        let randomMovie = movies[Math.floor(Math.random()*movies.length)];
        let randomEmoji = emojis[Math.floor(Math.random()*emojis.length)];
        const embeded = new Discord.MessageEmbed()
          .setTitle("The randomizr! :sunglasses:")
          .setDescription(`La película aleatoria es "${randomMovie}" ${randomEmoji}`)
          .setFooter("===============================================================");
          msg.channel.send(embeded);
      }
    }
  });
}

function deleteMovieOption(nombre:string,msg:any){
  fs.readFile(archivo, 'utf8', function readFileCallback(err:any, data:any){
    if(err){
        console.log(err);
    } else{
      let moviesJson:any = JSON.parse(data);
      for(let key in moviesJson) {
          set.add(key);
      }

      if(set.has(nombre)){ // La pelicula SI existe en el set
        set.delete(nombre);
        delete moviesJson[nombre]; // Eliminar del set y del arreglo
        var json = JSON.stringify([moviesJson]);
        json=(json.replace('[','').replace(']',''));

        // Escribir en el archivo la nueva informacion
        fs.writeFile(archivo, json, function(err:any){
          console.log(err);
          msg.reply(`Se eliminó "${nombre}" de la lista! :heavy_multiplication_x:`);
        });
      } else{
        msg.reply("La película no se encuentra en la lista.");
      }
    }
  });
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
    case '!ping':
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
