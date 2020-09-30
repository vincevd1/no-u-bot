const Discord = require('discord.js')

const GameManager = require('../managers/GameManager.js')

module.exports = {
    name: 'create',
    description: 'create an uno game',
    delay: 60000,

    execute(client, message, args) {
        if(GameManager.games.find(g => g.users.includes(message.author)) != undefined) {
            message.reply('You are already in a game, uno leave it first to create a new one')
            return;
        }

        let settings = undefined
        let unchangableSettings = []

        if(message.guild) {
            settings = {
                //visibility settings
                'public': false,
                'serverlist': false,
    
                //game settings
                'stackpenalties': true,
                'swaphands': false
            }
        } else {
            settings = {
                //visibility settings
                'public': false,
                'serverlist': true,
    
                //game settings
                'stackpenalties': true,
                'swaphands': false
            }
            console.log(settings)
            unchangableSettings.push('public')
        }

        let embed = new Discord.MessageEmbed()
            .setTitle('Create UNO game')
            .setDescription("Enable/disable some settings with 'uno setting <setting>' and type 'uno confirm' when ready!\n\u200B")
            .setThumbnail(client.user.avatarURL())
            .addFields(
                { name: 'Setting Label', value: "Public\n\nStack Penalties\n7-0 rule", inline: true },
                { name: 'Value', value: `${settings.public}\n\n${settings.stackpenalties}\n${settings.swaphands}\n\u200B`, inline: true },
                { name: 'Setting Name', value: `public\n\nstackpenalties\nswaphands\n\u200B`, inline: true }
            )
            .setFooter(`Created by ${message.author.tag}`)
            .setTimestamp(Date.now())
        message.channel.send(embed).then(function changeSetting(sentMessage) {
            message.channel.awaitMessages(m => m.content.startsWith('uno setting') || m.content.startsWith('uno confirm'), {max: 1, time: 300000, errors: ['time'] })
                .then(collected => {
                    let msg = collected.first()
                    let args = msg.content.split(' ')

                    if(msg.author != message.author) {
                        msg.reply("You're not the creator of the game so don't change the settings, please")
                        msg.delete().catch(() => {})
                        changeSetting(sentMessage)
                        return;
                    }

                    switch(args[1]) {
                        case 'setting':
                            if(args.length >= 4) {
                                if(args[2] in settings) {
                                    if(args[3] == 'true' || args[3] == 'false') {
                                        if(!unchangableSettings.includes(args[2])) {
                                            let value = (args[3] === 'true')
                                            settings[args[2]] = value

                                            let successEmbed = new Discord.MessageEmbed()
                                                .setColor(0x06ab00)
                                                .setTitle('Create UNO game')
                                                .setDescription(`Enable/disable some settings with 'uno setting <setting>' and type 'uno confirm' when ready!\n\u200B\n**Successfully changed setting '${args[2]}' to '${value}'**\n\u200B`)
                                                .setThumbnail(client.user.avatarURL())
                                                .addFields(
                                                    { name: 'Setting Label', value: "Public\n\nStack Penalties\n7-0 rule", inline: true },
                                                    { name: 'Value', value: `${settings.public}\n\n${settings.stackpenalties}\n${settings.swaphands}\n\u200B`, inline: true },
                                                    { name: 'Setting Name', value: `public\n\nstackpenalties\nswaphands\n\u200B`, inline: true }
                                                )
                                                .setFooter(`Game created by ${message.author.tag}`)
                                                .setTimestamp(Date.now())
                                            sentMessage.edit(successEmbed).catch((err) => { console.log(err) })

                                            changeSetting(sentMessage)
                                        } else {
                                            let errorEmbed = new Discord.MessageEmbed()
                                                .setColor(0xab0000)
                                                .setDescription('This setting cannot be changed!')
                                            message.channel.send(errorEmbed)
                                            changeSetting(sentMessage)
                                        }
                                    } else {
                                        let errorEmbed = new Discord.MessageEmbed()
                                            .setColor(0xab0000)
                                            .setDescription('Please specify a valid value (true or false)')
                                        message.channel.send(errorEmbed)
                                        changeSetting(sentMessage)
                                    }
                                } else {
                                    let errorEmbed = new Discord.MessageEmbed()
                                        .setColor(0xab0000)
                                        .setDescription('The setting you specified does not exist!')
                                    message.channel.send(errorEmbed)
                                    changeSetting(sentMessage)
                                }
                            } else {
                                let errorEmbed = new Discord.MessageEmbed()
                                    .setColor(0xab0000)
                                    .setDescription('Please specify a setting and a value')
                                message.channel.send(errorEmbed)
                                changeSetting(sentMessage)
                            }
                        break;

                        case 'confirm':
                            let newGame = new GameManager.Game(sentMessage, message.author, settings)
                            newGame.users.push(message.author)
                            newGame.hands.set(message.author.id, [])

                            let successEmbed = new Discord.MessageEmbed()
                                .setColor(0x06ab00)
                                .setTitle('Created UNO game')
                                .setDescription(`Created a new game with code **'${newGame.code}'** and the following settings:\n\u200B`)
                                .setThumbnail(client.user.avatarURL())
                                .addFields(
                                    { name: 'Setting Label', value: "Public\n\nStack Penalties\n7-0 rule", inline: true },
                                    { name: 'Value', value: `${settings.public}\n\n${settings.stackpenalties}\n${settings.swaphands}\n\u200B`, inline: true },
                                    { name: 'Setting Name', value: `public\n\nstackpenalties\nswaphands\n\u200B`, inline: true }
                                )
                                .addField('Players', `${newGame.getUsersAsString()}`)

                                if(message.guild) successEmbed.addField(`\u200B`, `**Use 'uno join <code>' to join! Or click the reaction!**\n\u200B`)
                                else successEmbed.addField(`\u200B`, `**Use 'uno join <code>' to join!**\n\u200B`)

                                .setFooter(`Game created by ${message.author.tag}`)
                                .setTimestamp(Date.now())
                            sentMessage.edit(successEmbed)

                            if (message.guild) {
                                sentMessage.react('👋').then(function awaitReactions() {
                                    let reactingUser = undefined
                                    const filter = (reaction, user) => {
                                        reactingUser = user
                                        return reaction.emoji.name == '👋' && !user.bot;
                                    };

                                    sentMessage.awaitReactions(filter, { max: 1, time: 300000, errors: ['time'] })
                                        .then(() => {
                                            if (newGame.isStarted || newGame.users.includes(reactingUser) || GameManager.games.find(g => g.users.includes(reactingUser)) != undefined || newGame.users >= 8 || newGame.message == undefined) return;

                                            newGame.users.push(reactingUser)
                                            newGame.hands.set(reactingUser.id, [])

                                            let successEmbed = new Discord.MessageEmbed()
                                                .setColor(0x06ab00)
                                                .setTitle('Created UNO game')
                                                .setDescription(`Created a new game with code **'${newGame.code}'** and the following settings:\n\u200B`)
                                                .setThumbnail(client.user.avatarURL())
                                                .addFields(
                                                    { name: 'Setting Label', value: "Public\n\nStack Penalties\n7-0 rule", inline: true },
                                                    { name: 'Value', value: `${newGame.settings.public}\n\n${newGame.settings.stackpenalties}\n${newGame.settings.swaphands}\n\u200B`, inline: true },
                                                    { name: 'Setting Name', value: `public\n\nstackpenalties\nswaphands\n\u200B`, inline: true }
                                                )
                                                .addField('Players', `${newGame.getUsersAsString()} **(Just joined!)**`)
                                                .addField(`\u200B`, `**Use 'uno join <code>' to join!**\n\u200B`)
                                                .setFooter(`Game created by ${message.author.tag}`)
                                                .setTimestamp(Date.now())
                                            newGame.message.edit(successEmbed)

                                            awaitReactions()
                                        })
                                        .catch((err) => {
                                            console.log(err)
                                            if (!newGame.isStarted) {
                                                let expiredEmbed = new Discord.MessageEmbed()
                                                    .setColor(0xab0000)
                                                    .setTitle('Uno game expired')
                                                    .setDescription('You took too long to start the game so I deleted it')
                                                message.channel.send(expiredEmbed)

                                                GameManager.games.splice(GameManager.games.find(g => g.code === newGame.code), 1)
                                            }
                                        })
                                })
                            }
                        break;
                    }

                    msg.delete().catch(() => {})
                })
                .catch((err) => {
                    console.log(err)
                    message.reply("You didn't reply to me for 5 minutes so I cancelled the creation of the game. Feel free to make a new one when you're back")
                })
        })
    }
}