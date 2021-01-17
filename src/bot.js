"use strict";
require('dotenv').config();
var axios = require('axios')["default"];
var Discord = require('discord.js');
var client = new Discord.Client();
/*REQUEST TO OPEN LIBRARY*/
var getBookInfo = function () {
    var isbn = "9780140328721.json";
    var openLibraryURL = "https://openlibrary.org/isbn/";
    axios.get(openLibraryURL + isbn)
        .then(function (response) {
        console.log(response);
    })["catch"](function (error) {
        console.log(error);
    });
};
client.on('ready', function () {
    console.log("Logged in as " + client.user.tag);
});
client.on('message', function (msg) {
    var message = msg.content;
    if (message == 'ping') {
        msg.reply('pong');
    }
    else if (message == 'marco' || message == 'Marco') {
        msg.reply('Polooo');
    }
    else if (message == 'getbook') {
        getBookInfo();
    }
});
client.login(process.env.TOKEN);
console.log(process.env.TOKEN);
