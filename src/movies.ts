"use strict";

const Discord = require('discord.js');

const axios = require('axios').default;
const apaAxios = axios.create();
apaAxios.defaults.timeout = 3500;

const imdb_URL = "https://imdb-api.com/en/API/";

/*MOVIE*/
async function sendTrailerInfo(movie_id: string, msg: any){
  let response: any = await apaAxios.get('https://imdb-api.com/en/API/Trailer/',{
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
  const embeded = new Discord.MessageEmbed()
    .setTitle(title_info.fullTitle)
    .setDescription(`**Plot**: ${title_info.plot}\n **Dirige** ${title_info.directors}`)
    .setImage(title_info.image)
    .setFooter(`Duración: ${title_info.runtimeStr} Reparto: ${title_info.stars}`);
    msg.channel.send(embeded);
}

async function getMovieInfo(movie_query: string){
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

async function searchMovie(movie_query: string, msg: any){
  let response: any = await getMovieInfo(movie_query);

  try{
    if(response.status == 200){
      let movie_id: string = response.data.results[0].id;
      sendMovieInfo(movie_id, msg);
      sendTrailerInfo(movie_id, msg);
    }else{
      msg.reply("No se ha encontrado :cry:");
    }
  }catch{
    msg.reply("mmmm puede que el servicio de IMDB esté down :frowning:");
  }
}

async function searchTrailer(movie_query: string, msg: any){
  let response: any = await getMovieInfo(movie_query);

  try{
    if(response.status == 200){
      let movie_id: string = response.data.results[0].id;
      sendTrailerInfo(movie_id, msg);
    }else{
      msg.reply("No se ha encontrado :cry:");
    }
  }catch{
    msg.reply("mmmm puede que el servicio de IMDB esté down :frowning:");
  }
}

export { searchMovie, searchTrailer }
