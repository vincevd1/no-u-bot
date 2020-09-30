const ytdl = require('ytdl-core')

const whitelist = ['sjustan#5926', 'Vince#7192']

module.exports = {
    name: 'rickroll',
    description: "RickRoll those fella's",
    
    execute(client, message, args) {
        if(!message.guild) { message.channel.send('This command is only available in servers'); return; }
            if(args.length > 2 && whitelist.includes(message.author.tag)) {
                let user = undefined
                if(message.mentions.users.size == 0 && message.guild.members.cache.find(m => m.user.username === args[2]) != undefined) {
                    user = message.guild.members.cache.find(m => m.user.username === args[2]).user
                } else if(message.mentions.users.size > 0) {
                    user = message.mentions.users.first()
                } else {
                    message.author.send("Could not find a user by the name of '" + args[2] + "' in server '" + message.guild.name + "'")
                }

                if(user != undefined) {
                    let voiceChannel = undefined

                    message.guild.channels.cache.forEach(channel => {
                        if(channel.type == "voice") {
                            channel.members.forEach(member => {
                                if(member.id == user.id) {
                                    voiceChannel = channel
                                    return;
                                }
                            })
                        }
                    })

                    if(voiceChannel != undefined) {
                        client.voice.joinChannel(voiceChannel)
                            .then(connection => {
                                connection.play(ytdl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { highWaterMark: 1 << 25 }))
                                .on('finish', () => {
                                    connection.disconnect();
                                })
                            }).catch(console.error);
                    } else {
                        message.author.send("User by the name of '" + args[2] +  "' is not in a voice channel in the server you used this command in")
                    }
                }
            } else message.reply("You don't have permission to use this command")
    }
}