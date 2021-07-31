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
exports.getBookInfo = exports.validISBN = void 0;
const axios = require('axios').default;
const apaAxios = axios.create();
apaAxios.defaults.timeout = 3500;
const open_library_URL = "https://openlibrary.org/";
function getFormattedApa(response, author) {
    let year_published = (response["publish_date"]) ? new Date(response["publish_date"]).getFullYear().toString() : "...";
    let title = (response["title"]) ? response["title"] : "...";
    let publisher = (response["publishers"]) ? response["publishers"][0] : "...";
    return `${author} (${year_published}). *${title}*. ${publisher}`;
}
function getAuthorInfo(author_key) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield apaAxios.get(`${open_library_URL}authors/${author_key}.json`)
            .then(function (response) {
            return response;
        })
            .catch(function (error) {
            return error;
        });
        if (response.status == 200) {
            return response.data["personal_name"] || response.data["name"];
        }
        return "...";
    });
}
function getBookInfo(isbn, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield apaAxios.get(`${open_library_URL}isbn/${isbn}.json`)
            .then(function (response) {
            return response;
        })
            .catch(function (error) {
            console.log("Error en getBookInfo");
            console.log(error);
            return error;
        });
        if (response.status == 200) {
            let author = "...";
            if (response.data["authors"]) {
                let author_key = response.data["authors"][0].key.split('/')[2];
                author = yield getAuthorInfo(author_key);
            }
            msg.reply(getFormattedApa(response.data, author));
        }
        else if (response.code == "ECONNABORTED") {
            msg.reply("Puede que el servicio de OpenLibrary se haya caído, confiemos que se repondrá :pray:");
        }
        else {
            msg.reply("No fue encontrado :confused:");
        }
    });
}
exports.getBookInfo = getBookInfo;
function validISBN(argument) {
    if (argument) {
        let arg = argument.replace(/-/gi, '');
        if (arg.length == 10 || arg.length == 13) {
            return true;
        }
    }
    return false;
}
exports.validISBN = validISBN;
//# sourceMappingURL=books.js.map