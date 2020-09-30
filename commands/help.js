const Discord = require('discord.js');
const { codePointAt } = require('ffmpeg-static');
const { commandList } = require('./commands.json');

module.exports = {
    name: 'help',
    description: 'Lists all commands',

    execute(client, message, args) {

        let helpResponse = new Discord.MessageEmbed()
            .setTitle("no u help message")
            .setDescription("All of the commands explained.");

        for(let i = 0; i < commandList.length; i++) {
            helpResponse.addField(commandList[i].name, commandList[i].description);
        }

        message.channel.send(helpResponse)
    }
};