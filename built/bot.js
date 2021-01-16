"use strict";
require('dotenv').config();
var Discord = require('discord.js');
var client = new Discord.Client();
client.on('ready', function () {
    console.log("Logged in as " + client.user.tag);
});
client.on('message', function (msg) {
    if (msg.content == 'ping') {
        msg.reply('pong');
    }
    else if (msg.content == 'marco' || msg.content == 'Marco') {
        msg.reply('Polooo');
    }
});
client.login(process.env.TOKEN);
