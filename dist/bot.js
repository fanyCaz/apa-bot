"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const axios = require('axios').default;
const instance = axios.create();
instance.defaults.timeout = 2500;
const books_1 = require("./books");
const movies_1 = require("./movies");
function sendHelpCommands(msg) {
    let commands = "ping -> pong! \n " +
        "!libro -> Dame un ISBN y traeré la referencia APA de ese libro (dependiendo de la información que encuentre) \n" +
        "!pelicula -> Buscaré información y trailer de la película que me digas, como '!pelicula godzilla' \n" +
        "!lista -> Mostraré todas las películas que tengas agregadas para ver después \n" +
        "!sugerir -> Agregaré la película que escribas a la lista, escríbela como '!sugerir Buscando a Nemo' \n" +
        "!elegir -> Seleccionaré una película al azar y te diré el nombre \n" +
        "Toma en cuenta que estoy chiquito :pensive: y puedo cometer errores medio sonsos :pleading_face:";
    const embeded = new Discord.MessageEmbed()
        .setTitle("Comandos disponibles")
        .setDescription(commands)
        .setFooter("Sugerencias en issues de https://github.com/fanyCaz/apa-bot");
    msg.channel.send(`\`\`\`yaml
  ╱╱╭╮╱╭╮╱╱╱╱╱╱╱╱╭╮╱╱╱╱╱╱╱╱╱╱╱╱╱╱╭╮╭╮╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╭╮╱╱╱╱╭╮╱╭╮╱╭╮
  ╱╱┃┃╱┃┃╱╱╱╱╱╱╱╱┃┃╱╱╱╱╱╱╱╱╱╱╱╱╱╭╯╰┫┃╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱┃┃╱╱╱╭╯╰╮┃┃╱┃┃
  ╭━╯┣━╯┃╭╮╭╮╭┳━━┫┃╭━━┳━━┳╮╭┳━━╮╰╮╭┫╰━┳━━╮╭━━┳━━┳━━╮╱╱┃╰━┳━┻╮╭╯┃╰━┫╰━╮
  ┃╭╮┃╭╮┃┃╰╯╰╯┃┃━┫┃┃╭━┫╭╮┃╰╯┃┃━┫╱┃┃┃╭╮┃┃━┫┃╭╮┃╭╮┃╭╮┣━━┫╭╮┃╭╮┃┃╱┃╭╮┃╭╮┃
  ┃╰╯┃╰╯┃╰╮╭╮╭┫┃━┫╰┫╰━┫╰╯┃┃┃┃┃━┫╱┃╰┫┃┃┃┃━┫┃╭╮┃╰╯┃╭╮┣━━┫╰╯┃╰╯┃╰╮┃╰╯┃╰╯┃
  ╰━━┻━━╯╱╰╯╰╯╰━━┻━┻━━┻━━┻┻┻┻━━╯╱╰━┻╯╰┻━━╯╰╯╰┫╭━┻╯╰╯╱╱╰━━┻━━┻━╯╰━━┻━━╯
  ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱┃┃
  ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╰╯
                    \`\`\`    `);
    msg.channel.send(embeded);
}
console.log("======= WARNING ======= ");
console.log("Toma en cuenta que se está utilizando Nodemon, el cual refresca el servidor cada vez que hay cambios en los archivos.\n POR LO TANTO cada vez que sugieras o elimines una película, se guardarán los cambios en 'movies.json', lo que ocasionará que NODEMON actúe.");
function isValidArgument(argument) {
    if (argument.length > 0) {
        return true;
    }
    return false;
}
const Discord = require('discord.js');
const client = new Discord.Client();
client.on('ready', () => {
    console.log(`logged in ${client.user.tag}`);
});
client.on('message', (msg) => {
    let message = msg.content;
    if (msg.author.bot) {
        return;
    }
    let args = message.trim().split(/ +/);
    let command = args.shift();
    switch (command) {
        case '!ping':
            msg.reply('pong');
            break;
        case '!mina':
            msg.reply('ya dejame ir con el gatooooo');
            break;
        case '!libro':
            if (books_1.validISBN(args[0])) {
                let isbn = args[0].replace(/-/gi, '');
                msg.reply("Dame unos segundos para buscar uwu");
                books_1.getBookInfo(isbn, msg);
            }
            else {
                msg.reply("Pasa un isbn porfavor :upside_down_face:");
            }
            break;
        case '!pelicula':
            if (isValidArgument(args)) {
                let movie_query = args.join(' ');
                msg.reply("Dame unos segundos para buscar uwu");
                movies_1.searchMovie(movie_query, msg);
            }
            else {
                msg.reply("Pasa el nombre de una película :upside_down_face:");
            }
            break;
        case '!trailer':
            if (isValidArgument(args)) {
                let expression = args.join(' ');
                msg.reply("Dame unos segundos para buscar uwu");
                movies_1.searchTrailer(expression, msg);
            }
            else {
                msg.reply("Pasa el nombre de una película :upside_down_face:");
            }
            break;
        case '!sugerir':
            msg.reply("Coming soon");
            break;
        case '!lista':
            msg.reply("Coming soon");
            break;
        case '!eliminar':
            msg.reply("Coming soon");
            break;
        case '!elegir':
            msg.reply("Coming soon");
            break;
        case '!ayuda':
        case '!help':
            sendHelpCommands(msg);
            break;
    }
});
client.login(process.env.TOKEN);
//# sourceMappingURL=bot.js.map