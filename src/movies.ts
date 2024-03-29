"use strict";

const Discord = require('discord.js');

const axios = require('axios').default;
const apaAxios = axios.create();
apaAxios.defaults.timeout = 3500;

const imdb_URL = "https://imdb-api.com/en/API/";

function isValidResponse(response: any): boolean{
  let isValid = (response.status == 200 && response.data);
  return isValid;
}

function printError(response: any){
  console.log(response.status);
  console.log(response);
}

async function getTitleInfo(movie_id: string){
  let response: any = await axios.get(imdb_URL + 'Title/',{
    params: {
      apiKey: process.env.API_KEY,
      id: movie_id
    }
  }).then(function(res: any){
    return res;
  }).catch(function(error: any){
    return error;
  });

  return response;
}

async function sendMovieInfo(title_info: any, msg: any){
  const embeded = new Discord.MessageEmbed()
    .setTitle(title_info.fullTitle)
    .setDescription(`**Plot**: ${title_info.plot}\n **Dirige** ${title_info.directors}`)
    .setImage(title_info.image)
    .setFooter(`Duración: ${title_info.runtimeStr} Reparto: ${title_info.stars}`);
  msg.channel.send(embeded);
}

function sendTrailerInfo(trailer_info: any, msg: any){
  let description: string = (trailer_info.linkEmbed) ? `Si no te funciona el título, puedes usar este: ${trailer_info.linkEmbed}` : '' ;
  const embeded = new Discord.MessageEmbed()
    .setTitle(`Trailer: ${trailer_info.fullTitle}`)
    .setDescription(description)
    .setURL(trailer_info.link);
  msg.channel.send(embeded);
}

async function getCoincidence(movie_query: string){
  let response: any = await axios.get(imdb_URL + 'SearchMovie/',{
    params: {
      apiKey: process.env.API_KEY,
      expression: movie_query
    }
  }).then(function(res: any){
    return res;
  }).catch(function(error: any){
    return error;
  });

  return response;
}

async function findMovieId(movie_query: string, msg: any){
  let movie_id = "";

  let matching_coincidence = await getCoincidence(movie_query);
  if(!isValidResponse(matching_coincidence)){
    printError(matching_coincidence);
    msg.reply("No se ha encontrado :confused:");
    return '';
  }

  movie_id = matching_coincidence.data.results[0].id;
  return movie_id;
}

async function replyWithMovieInformation(movie_id: string, msg: any){
  let title_info: any = await getTitleInfo(movie_id);
  if(isValidResponse(title_info)){
    sendMovieInfo(title_info.data, msg);
  }else{
    printError(title_info);
    msg.reply("Ha ocurrido un error al buscarlo :skull:");
  }
}

async function replyWithTrailerInformation(movie_id: string, msg: any){
  let trailer_info: any = await getTrailerInfo(movie_id);
  if(isValidResponse(trailer_info)){
    sendTrailerInfo(trailer_info.data, msg);
  }else{
    printError(trailer_info);
    msg.reply("Ha ocurrido un error al buscarlo :skull:");
  }
}

async function searchMovie(movie_query: string, msg: any){
  let movie_id: string = await findMovieId(movie_query, msg);
  replyWithMovieInformation(movie_id, msg);
  replyWithTrailerInformation(movie_id, msg);
}

async function getTrailerInfo(movie_id: string){
  let response: any = await apaAxios.get(imdb_URL + 'Trailer/', {
    params: {
      apiKey: process.env.API_KEY,
      id: movie_id
    }
  }).then(function(res: any){
    return res;
  }).catch(function(error: any){
    return error;
  });

  return response;
}

async function searchTrailer(movie_query: string, msg: any){
  let movie_id: string = await findMovieId(movie_query, msg);
  replyWithTrailerInformation(movie_id, msg);
}

export { searchMovie, searchTrailer }
