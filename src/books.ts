"use strict";

const axios = require('axios').default;
const apaAxios = axios.create();
apaAxios.defaults.timeout = 2500;

const open_library_URL = "https://openlibrary.org/";

function getFormattedApa(response: any, author: string): string{
  let year_published: string = (response["publish_date"]) ? new Date(response["publish_date"]).getFullYear().toString() : "...";
  let title: string = (response["title"]) ? response["title"] : "...";
  let publisher: string = (response["publishers"]) ? response["publishers"][0] : "...";
  return `${author} (${year_published}). *${title}*. ${publisher}`;
}

async function getAuthorInfo(author_key: string): Promise<string>{
  let response: any = await apaAxios.get(`${open_library_URL}authors/${author_key}.json`)
    .then(function(response: unknown){
      return response;
    })
    .catch(function(error: unknown){
      return error;
    });
  if(response.status == 200){
    return response.data["personal_name"] || response.data["name"];
  }
  return "...";
}

async function getBookInfo(isbn: string, msg: any){
  let response: any = await apaAxios.get(`${open_library_URL}isbn/${isbn}.json`)
    .then(function(response: unknown){
      return response;
    })
    .catch(function(error: unknown){
      console.log("Error en getBookInfo");
      console.log(error);
      return error;
    });
  if(response.status == 200){
    let author: string = "...";
    if(response.data["authors"]){
      let author_key: string = response.data["authors"][0].key.split('/')[2];
      author = await getAuthorInfo(author_key);
    }
    msg.reply( getFormattedApa(response.data, author) );
  }else if(response.code == "ECONNABORTED"){
    msg.reply("Puede que el servicio de OpenLibrary se haya caído, confiemos que se repondrá :pray:");
  }else{
    msg.reply("No fue encontrado :confused:");
  }
}

export { getBookInfo } 
