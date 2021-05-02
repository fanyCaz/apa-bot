"use strict";


require('dotenv').config();

const axios = require('axios').default;

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () =>{
    console.log(`logged in ${client.user.tag}`);
});

client.on('message', (msg: string) =>{
    let message: string = msg;
    
    console.log(message);
});

client.login(process.env.TOKEN);