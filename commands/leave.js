const Discord = require('discord.js')
const GameManager = require('../managers/GameManager.js')

module.exports = {
    name: 'leave',
    description: "Leave an UNO game",

    execute(client, message, args) {
        let game = GameManager.games.find(g => g.users.includes(message.author))
        if(game != undefined) {
            let embed = new Discord.MessageEmbed()
                .setTitle('Left UNO game')
                .setDescription('Successfully left the uno game')
                .setColor(0xa3000b)
            message.channel.send(embed)

            if(game.author.id == message.author.id && game.isStarted == false) {
                game.author = game.users[1]

                game.message.delete()
                game.message = game.dmMessages.shift()
            } else {
                game.dmMessages.find(dm => dm.channel.recipient.id == message.author.id).delete()
                game.dmMessages.splice(game.dmMessages.indexOf(game.dmMessages.find(dm => dm.channel.recipient.id == message.author.id)), 1)

                game.announce(message.author, '**left the game**')
            }

            game.users.splice(game.users.indexOf(message.author), 1)

            if(game.isStarted == true && (game.currentTurn == message.author || game.users.length == 1)) {
                game.update()
            }

            if (game.isStarted == false) {
                if(game.users.length == 0) {
                    game.endGame()
                    return
                }

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
                    .addField('Players', `${game.getUsersAsString()}`)

                    if (message.guild) successEmbed.addField(`\u200B`, `**Use 'uno join <code>' to join! Or click the reaction!**\n\u200B`)
                    else successEmbed.addField(`\u200B`, `**Use 'uno join <code>' to join!**\n\u200B`)

                    .setFooter(`Game created by ${game.author.tag}`)
                    .setTimestamp(Date.now())
                game.message.edit(successEmbed)

                game.dmMessages.forEach(dm => {
                    dm.edit(successEmbed)
                    console.log(dm)
                })
            }
        } else message.reply('You are not in a game')
    }
}