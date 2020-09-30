const Discord = require('discord.js')
const { client } = require('../main.js')

const userSettings = new Discord.Collection()
const userPermissions = new Discord.Collection()
const userInventory = new Discord.Collection()

userInventory.set('233245266097078282', { badges: ['<:administrator:742003773840424970>'] })

module.exports = {
    userSettings: userSettings,
    userPermissions: userPermissions,
    userInventory: userInventory,

    getUsernameWithBadges(user) {
        let res = user.tag

        let userInv = userInventory.get(user.id)
        if(userInv != undefined && userInv.badges != undefined) {
            for(let i = 0; i < userInv.badges.length; i++) {
                res += userInv.badges[i]
            }
        }

        return res
    }
}