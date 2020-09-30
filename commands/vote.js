const Discord = require('discord.js')

module.exports = {
    name: 'vote',
    description: "Vote for something",

    execute(client, message, args) {
        if (args.length > 2) {
            let embed = new Discord.MessageEmbed()
                .setColor(0xad0000)
                .setTitle('Vote')
                .setDescription(message.content.replace('uno vote', ''))
                .setThumbnail(message.author.avatarURL())
                .setFooter("Vote started by " + message.author.tag)
            message.channel.send(embed).then(async sentMessage => {
                await sentMessage.react('✅')
                await sentMessage.react('❌')
            })
        }
    }
}
