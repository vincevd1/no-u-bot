const fs = require('fs')
const Discord = require('discord.js')
const { prefix, token } = require('./config.json')

const client = new Discord.Client()
client.commands = new Discord.Collection()

const delays = []

client.on('message', message => {
    if(message.content.startsWith(prefix)) {
        let args = message.content.split(' ')
        let commandName = args[1]
        
        let command = client.commands.find(c => c.name === commandName)
        if(command != undefined) {
            let delay = delays.find(d => d.client == message.author && d.command == command.name)
            if(delay == undefined) {
                command.execute(client, message, args)

                if (command.delay != undefined) {
                    delays.push({ date: Date.now(), client: message.author, command: command.name, message: undefined })

                    setTimeout(() => {
                        let newDelay = delays.find(d => d.client == message.author && d.command == command.name)

                        if(newDelay.message != undefined) {
                            newDelay.message.delete()
                        }

                        delays.splice(delays.indexOf(newDelay), 1)
                    }, command.delay)
                }
            } else if(delay.message == undefined) {
                message.channel.send(`Please wait for another **${Math.abs(Date.now() - delays.find(d => d.client == message.author && d.command == command.name).date - command.delay) / 1000}** seconds`)
                    .then(sentMessage => {
                        delay.message = sentMessage
                    })
            } else {
                delay.message.edit(`Please wait for another **${Math.abs(Date.now() - delays.find(d => d.client == message.author && d.command == command.name).date - command.delay) / 1000}** seconds`)
            }
        }

        if(message.guild && !message.deleted) {
            message.delete()
                .catch(() => {})
        }
    }
})

client.on('ready', () => {
    console.log("bruh dude")

    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`)
        client.commands.set(command.name, command)
    }

    client.user.setActivity({
        name: "uno help to " + client.users.cache.size + " users",
        type: "STREAMING",
        url: 'https://www.twitch.tv/directory/game/Uno'
    });
})

client.login(token)

module.exports = {
    client: client
}