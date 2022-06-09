"use strict";

const Discord = require('discord.js');

const movieSet = new Set();

function addMovie(expresion: string, msg: any){
  if (movieSet.has(expresion)){
    msg.reply("La película ya se encuentra en la lista :exclamation:");
    return;
  }
  movieSet.add(expresion);
  msg.reply("¡Se ha agregado tu sugerencia a la lista! :heavy_check_mark:");
}
function movieList(msg: any){
  if(movieSet.size===0){
    msg.reply(`Aún no hay películas en la lista. Añade una con '!sugerir {pelicula}' :slight_smile:`);
    return
  }
  const embeded = new Discord.MessageEmbed()
      .setTitle("PELICULAS:")
      .setDescription([...movieSet])
      .setFooter(`Elige una película al azar con '!elegir'`);
    msg.channel.send(embeded);
}
function deleteMovie(expresion: string, msg: any){
  if(movieSet.has(expresion)){
    movieSet.delete(expresion);
    msg.reply("Se ha eliminado la película de la lista :frowning:"); 
    return;
  }
  msg.reply("La película ya no se encuentra en la lista :x:"); 
}
function selectMovie(msg: any){
  if(movieSet.size===0){
    msg.reply(`Aún no hay películas en la lista. Añade una con '!sugerir {pelicula}' :slight_smile:`);
    return;
  }
  const movie=[...movieSet][Math.floor(Math.random()*movieSet.size)];
  msg.reply(`La película elegida es: ${movie} :movie_camera:`);
}

export { addMovie, movieList, deleteMovie, selectMovie }
