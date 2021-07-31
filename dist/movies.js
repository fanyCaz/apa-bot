"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTrailer = exports.searchMovie = void 0;
const Discord = require('discord.js');
const axios = require('axios').default;
const apaAxios = axios.create();
apaAxios.defaults.timeout = 3500;
const imdb_URL = "https://imdb-api.com/en/API/";
function isValidResponse(response) {
    let isValid = (response.status == 200 && response.data);
    return isValid;
}
function printError(response) {
    console.log(response.status);
    console.log(response);
}
function getTitleInfo(movie_id) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield axios.get(imdb_URL + 'Title/', {
            params: {
                apiKey: process.env.API_KEY,
                id: movie_id
            }
        }).then(function (res) {
            return res;
        }).catch(function (error) {
            return error;
        });
        return response;
    });
}
function sendMovieInfo(title_info, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const embeded = new Discord.MessageEmbed()
            .setTitle(title_info.fullTitle)
            .setDescription(`**Plot**: ${title_info.plot}\n **Dirige** ${title_info.directors}`)
            .setImage(title_info.image)
            .setFooter(`Duración: ${title_info.runtimeStr} Reparto: ${title_info.stars}`);
        msg.channel.send(embeded);
    });
}
function sendTrailerInfo(trailer_info, msg) {
    let description = (trailer_info.linkEmbed) ? `Si no te funciona el título, puedes usar este: ${trailer_info.linkEmbed}` : '';
    const embeded = new Discord.MessageEmbed()
        .setTitle(`Trailer: ${trailer_info.fullTitle}`)
        .setDescription(description)
        .setURL(trailer_info.link);
    msg.channel.send(embeded);
}
function getCoincidence(movie_query) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield axios.get(imdb_URL + 'SearchMovie/', {
            params: {
                apiKey: process.env.API_KEY,
                expression: movie_query
            }
        }).then(function (res) {
            return res;
        }).catch(function (error) {
            return error;
        });
        return response;
    });
}
function findMovieId(movie_query, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let movie_id = "";
        let matching_coincidence = yield getCoincidence(movie_query);
        if (!isValidResponse(matching_coincidence)) {
            printError(matching_coincidence);
            msg.reply("No se ha encontrado :confused:");
            return '';
        }
        movie_id = matching_coincidence.data.results[0].id;
        return movie_id;
    });
}
function replyWithMovieInformation(movie_id, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let title_info = yield getTitleInfo(movie_id);
        if (isValidResponse(title_info)) {
            sendMovieInfo(title_info.data, msg);
        }
        else {
            printError(title_info);
            msg.reply("Ha ocurrido un error al buscarlo :skull:");
        }
    });
}
function replyWithTrailerInformation(movie_id, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let trailer_info = yield getTrailerInfo(movie_id);
        if (isValidResponse(trailer_info)) {
            sendTrailerInfo(trailer_info.data, msg);
        }
        else {
            printError(trailer_info);
            msg.reply("Ha ocurrido un error al buscarlo :skull:");
        }
    });
}
function searchMovie(movie_query, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let movie_id = yield findMovieId(movie_query, msg);
        replyWithMovieInformation(movie_id, msg);
        replyWithTrailerInformation(movie_id, msg);
    });
}
exports.searchMovie = searchMovie;
function getTrailerInfo(movie_id) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield apaAxios.get(imdb_URL + 'Trailer/', {
            params: {
                apiKey: process.env.API_KEY,
                id: movie_id
            }
        }).then(function (res) {
            return res;
        }).catch(function (error) {
            return error;
        });
        return response;
    });
}
function searchTrailer(movie_query, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let movie_id = yield findMovieId(movie_query, msg);
        replyWithTrailerInformation(movie_id, msg);
    });
}
exports.searchTrailer = searchTrailer;
//# sourceMappingURL=movies.js.map