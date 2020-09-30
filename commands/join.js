const Discord = require('discord.js')
const GameManager = require('../managers/GameManager.js')

module.exports = {
    name: 'join',
    description: "Join an UNO game",

    execute(client, message, args) {
        if (args.length > 2) {
            let game = GameManager.games.find(g => g.code === args[2])
            if (game != undefined && !game.users.includes(message.author)) {
                if (GameManager.games.find(g => g.users.includes(message.author)) == undefined) {
                    if (game.users.length <= 8) {
                        game.users.push(message.author)
                        game.hands.set(message.author.id, [])

                        let successEmbed = new Discord.MessageEmbed()
                            .setColor(0x06ab00)
                            .setTitle(`UNO game ${game.code}`)
                            .setDescription(`A new UNO game with code **'${game.code}'** and the following settings:\n\u200B`)
                            .setThumbnail(client.user.avatarURL())
                            .addFields(
                                { name: 'Setting Label', value: "Public\n\nStack Penalties\n7-0 rule", inline: true },
                                { name: 'Value', value: `${game.settings.public}\n\n${game.settings.stackpenalties}\n${game.settings.swaphands}\n\u200B`, inline: true },
                                { name: 'Setting Name', value: `public\n\nstackpenalties\nswaphands\n\u200B`, inline: true }
                            )
                            .addField('Players', `${game.getUsersAsString()} **(Just joined!)**`)

                        if (message.guild) successEmbed.addField(`\u200B`, `**Use 'uno join <code>' to join! Or click the reaction!**\n\u200B`)
                        else successEmbed.addField(`\u200B`, `**Use 'uno join <code>' to join!**\n\u200B`)

                            .setFooter(`Game created by ${game.author.tag}`)
                            .setTimestamp(Date.now())
                        game.message.edit(successEmbed)

                        game.dmMessages.forEach(dm => {
                            dm.edit(successEmbed)
                        })

                        if (message.channel.id != game.message.channel.id) {
                            message.author.send(successEmbed).then(sentMessage => {
                                game.dmMessages.push(sentMessage)
                            })
                        }
                    } else message.reply('Sorry but this game is full!')
                } else message.reply('You are already in a game, leave it first (uno leave) to join a new one')
            } else message.reply('This game does not exist or you are already in this game!')
        } else message.reply('Please specify a game code')

        message.delete().catch(err => { });
    }
}