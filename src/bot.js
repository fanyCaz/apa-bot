"use strict";
require('dotenv').config();
var axios = require('axios')["default"];
var Discord = require('discord.js');
var client = new Discord.Client();
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
});
client.login(process.env.TOKEN);
console.log(process.env.TOKEN);
