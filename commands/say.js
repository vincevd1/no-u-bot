const Discord = require('discord.js')
const GameManager = require('../managers/GameManager.js')

const bannedPeople = ['282476613940281345']

const delay = 25000

module.exports = {
    name: 'say',
    description: "Say something in the game chat!",
    delay: 20000,

    execute(client, message, args) {
        if (args[2] != undefined) {
            if (!bannedPeople.includes(message.author.id)) {
                let game = GameManager.games.find(g => g.users.includes(message.author))
                if (game != undefined) {
                    game.announce(message.author, message.content.replace(args[0], '').replace(args[1], ''))
                }
            } else message.reply('You are banned from the chat')
        } else message.reply('Please specify a message')
    }
}