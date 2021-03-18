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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
require('dotenv').config();
var axios = require('axios')["default"];
var Discord = require('discord.js');
var client = new Discord.Client();
function iterateMovies(movie) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios.get('https://imdb-api.com/en/API/Title/', {
                        params: {
                            apiKey: process.env.API_KEY,
                            Id: movie['id']
                        }
                    }).then(function (res) {
                        return res['data'];
                    })["catch"](function (err) {
                        return err;
                    })];
                case 1:
                    result = _a.sent();
                    console.log(result);
                    return [2 /*return*/];
            }
        });
    });
}
/*REQUEST TO IMDB*/
function getMovieInfo(expression) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios.get('https://imdb-api.com/en/API/SearchMovie/', {
                        params: {
                            apiKey: process.env.API_KEY,
                            expression: expression
                        }
                    }).then(function (res) {
                        return res['data'];
                    })["catch"](function (err) {
                        return err;
                    })];
                case 1:
                    result = _a.sent();
                    if (result['results'].length < 1) {
                        return [2 /*return*/, 'No existe esa película :woman_shrugging:'];
                    }
                    return [4 /*yield*/, iterateMovies(result['results'][0])];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var apaReply = function (response, author) {
    var yearPublished = (response["publish_date"]) ? response["publish_date"].slice(-4) : "xxx";
    var title = (response["title"]) ? response["title"] : "xxx";
    var publisher = (response["publishers"]) ? response["publishers"][0] : "xxx";
    var reply = author + "(" + yearPublished + ")." + title + "." + publisher;
    return reply;
};
/*REQUEST TO OPEN LIBRARY*/
function getAuthorInfo(authorKey) {
    return __awaiter(this, void 0, void 0, function () {
        var openLibraryURL, authorData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    openLibraryURL = "https://openlibrary.org/authors/";
                    return [4 /*yield*/, axios.get("" + openLibraryURL + authorKey + ".json")
                            .then(function (response) {
                            return response;
                        })["catch"](function (error) {
                            return error;
                        })];
                case 1:
                    authorData = _a.sent();
                    if (authorData.status == 200) {
                        return [2 /*return*/, authorData.data["personal_name"]];
                    }
                    else {
                        return [2 /*return*/, "xxx"];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getBookInfo(isbn, msg) {
    return __awaiter(this, void 0, void 0, function () {
        var openLibraryURL, reply, authorID, authorName, citation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    openLibraryURL = "https://openlibrary.org/isbn/";
                    return [4 /*yield*/, axios.get("" + openLibraryURL + isbn + ".json")
                            .then(function (response) {
                            return response;
                        })["catch"](function (error) {
                            return error;
                        })];
                case 1:
                    reply = _a.sent();
                    if (!(reply.status == 200)) return [3 /*break*/, 3];
                    authorID = reply.data["authors"][0].key.split('/')[2];
                    return [4 /*yield*/, getAuthorInfo(authorID)];
                case 2:
                    authorName = _a.sent();
                    citation = apaReply(reply.data, authorName);
                    msg.reply(citation);
                    return [3 /*break*/, 4];
                case 3:
                    msg.reply("No se ha encontrado el libro :c");
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
;
client.on('ready', function () {
    console.log("Logged in as " + client.user.tag);
});
client.on('message', function (msg) {
    var message = msg.content;
    var channelID = msg.channel.id;
    var command = message.split(' ')[0];
    var args = message.split(' ');
    switch (command) {
        case 'ping':
            msg.reply('pong');
            break;
        case 'getbook':
            if (args.length > 1) {
                if (args[1].length == 10 || args[1].length == 13) {
                    var isbn = args[1];
                    getBookInfo(isbn, msg);
                }
            }
            else {
                msg.reply("Pasa un isbn porfavor :upside_down_face:");
            }
            break;
        case 'getmovie':
            if (args.length > 1) {
                args.shift();
                var search_expression = args.join(' ');
                console.log(search_expression);
                getMovieInfo(search_expression);
            }
    }
    ;
});
client.login(process.env.TOKEN);
