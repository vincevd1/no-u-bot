const Discord = require('discord.js')
const main = require('../main.js')
const UserManager = require('./UserManager.js')

const games = []

var cards = [
    '<:yellow0:740577264961323058>', '<:green0:740577264357605468>', '<:blue0:740577264936157224>', '<:red0:740577265007722566>',
    '<:yellow1:740577264877568001>', '<:green1:740577264550281359>', '<:blue1:740577264567320706>', '<:red1:740577264919380118>',
    '<:yellow2:740577264978362470>', '<:green2:740577264621846529>', '<:blue2:740577264651206660>', '<:red2:740577264437035022>',
    '<:yellow3:740577264898670654>', '<:green3:740577264327983195>', '<:blue3:740577264617521253>', '<:red3:740577264764452925>',
    '<:yellow4:740577264865116251>', '<:green4:740577264487628851>', '<:blue4:740577264583966750>', '<:red4:740577264458006591>',
    '<:yellow5:740577264827105300>', '<:green5:740577264613326919>', '<:blue5:740577264244359211>', '<:red5:740577264730898472>',
    '<:yellow6:740577264915185716>', '<:green6:740577264642818168>', '<:blue6:740577264647012352>', '<:red6:740577264789487636>',
    '<:yellow7:740577264881762416>', '<:green7:740577265045471292>', '<:blue7:740577264625909880>', '<:red7:740577264894476319>',
    '<:yellow8:740577265154523166>', '<:green8:740577264298885192>', '<:blue8:740577264181182495>', '<:red8:740577264567058483>',
    '<:yellow9:740577319751778414>', '<:green9:740577264726704238>', '<:blue9:740577264403480668>', '<:red9:740577264827236362>',
    '<:yellowskip:740577319378485370>', '<:greenskip:740577264651206710>', '<:blueskip:740577264705470515>', '<:redskip:740577264801939547>',
    '<:yellowplus2:740577319311376556>', '<:greenplus2:740577264369926144>', '<:blueplus2:740577264244228108>', '<:redplus2:740577264701407362>',
    '<:yellowreverse:740577319269171313>', '<:greenreverse:740577264709664778>', '<:bluereverse:740577264407806013>', '<:redreverse:740577264898408458>',
    '<:wildplus4:740577264923705434>', '<:wildcolor:740577264869179463>', '<:grabcard:740852082361499680>', '<:yellowcolor:740940180885864490>',
    '<:greencolor:740940260501880992>','<:bluecolor:740940219389313037>','<:redcolor:740940123881078785>', '<:redplus4:740952344560402553>',
    '<:blueplus4:740952344467996793>','<:greenplus4:740952344463933440>','<:yellowplus4:740952344396824667>',
]

class Game {
    constructor(message, author, settings) {
        this._code = createGameID()
        this._channel = message.channel
        this._message = message
        this.dmMessages = []
        this.chat = []
        this._isStarted = false
        this._author = author
        
        this._currentTurn = undefined
        this.lastTurn = undefined
        this._didLastTurnSayUNO = false
        this.direction = 'clockwise'
        this.awaitingPenalties = 0
        this._deck = createDeck()
        this._pile = []

        this._users = []
        this._hands = new Discord.Collection()
    
        this._settings = settings

        games.push(this)
    }

    get didLastTurnSayUNO() {
        return this._didLastTurnSayUNO
    }

    set didLastTurnSayUNO(v) {
        this._didLastTurnSayUNO = v
    }

    get code() {
        return this._code
    }

    get users() {
        return this._users
    }

    set users(v) {
        this._users = v
    }

    get settings() {
        return this._settings
    }

    set settings(v) {
        this._settings = v
    }

    get isStarted() {
        return this._isStarted
    }

    set isStarted(v) {
        this._isStarted = v
    }

    get deck() {
        return this._deck
    }

    set deck(v) {
        this._deck = v
    }

    get author() {
        return this._author
    }

    set author(v) {
        this._author = v
    }

    get message() {
        return this._message
    }

    set message(v) {
        this._message = v
    }

    get hands() {
        return this._hands
    }

    set hands(v) {
        this._hands = v
    }

    get pile() {
        return this._pile
    }

    set pile(v) {
        this._pile = v
    }

    get currentTurn() {
        return this._currentTurn
    }

    set currentTurn(v) {
        this._currentTurn = v
    }
}

Game.prototype.update = async function() {
    if(this.isStarted == false) {
        return;
    }

    if(this.users.length <= 1) {
        (this.users[0] != undefined) ? this.endGame(this.users[0].tag + ' won!') : this.endGame()
        return;
    }

    this.lastTurn = this.currentTurn
    if(this.direction == 'clockwise' /*&& !this.pile[this.pile.length - 1].includes('skip')*/) {
        if(this.users[this.users.indexOf(this.lastTurn) + 1] == undefined) {
            this.currentTurn = this.users[0]
        } else {
            this.currentTurn = this.users[this.users.indexOf(this.lastTurn) + 1]
        }
    } else if(this.direction == 'anticlockwise' /*&& !this.pile[this.pile.length - 1].includes('skip')*/) {
        if(this.users[this.users.indexOf(this.lastTurn) - 1] == undefined) {
            this.currentTurn = this.users[this.users.length - 1]   
        } else {
            this.currentTurn = this.users[this.users.indexOf(this.lastTurn) - 1]
        }
    }

    for(let i = 0; i < this.users.length; i++) {
        let privateGameEmbed = new Discord.MessageEmbed()
            .setTitle(`UNO Game **'${this.code}**'`)
            .setFooter(`It's ${this.currentTurn.tag}'s turn and the direction is ${this.direction}`)
            
        if(this.dmMessages[0] != undefined) {
            if(this.dmMessages[0].embeds[0].description != undefined) {
                privateGameEmbed.setDescription(this.dmMessages[0].embeds[0].description)
            }
        }
        
        let highestCardValue = 0
        let orderedUsers = {
            'user0': undefined,
            'user1': undefined,
            'user2': undefined,
            'user3': undefined,
            'user4': undefined,
            'user5': undefined,
            'user6': undefined,
            'user7': undefined,
        }

        for(let j = 0, k = i; j < this.users.length; j++, k++) {
            if(this.users[k] == undefined) {
                orderedUsers['user' + j] = this.users[0]
                k = 0
            } else {
                orderedUsers['user' + j] = this.users[k]
            }
        }

        switch(this.users.length) {
            case 2:
                highestCardValue = Math.max(this.hands.get(orderedUsers.user0.id).length, this.hands.get(orderedUsers.user1.id).length) - 2
                privateGameEmbed.addFields(
                    { name: '\u200B', value: '\u200B', inline: true},
                    { name:  UserManager.getUsernameWithBadges(orderedUsers.user1), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user1.id).length) + '\n\u200B', inline: true},
                    { name: '\u200B', value: '\u200B', inline: true},

                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: `Deck${'     '.repeat((highestCardValue > 6) ? highestCardValue : 6)}Pile`, value: `<:cardback:740578642731597854>${'<:filler:740645434350895194>'.repeat((highestCardValue > 6) ? highestCardValue : (highestCardValue > 21) ? 21 : 6)} ${this.pile[this.pile.length - 1]}\n\u200B`, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },

                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user0), value: this.hands.get(orderedUsers.user0.id).toString().replace(/,/g, '') + '\n\u200B', inline: true },
                    { name: '\u200B', value: '\u200B', inline: true }
                )
            break;
    
            case 3:
                highestCardValue = Math.max(this.hands.get(orderedUsers.user0.id).length, this.hands.get(orderedUsers.user2.id).length) - 2

                privateGameEmbed.addFields(
                    { name: '\u200B', value: '\u200B', inline: true},
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user2), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user2.id).length) + '\n\u200B', inline: true},
                    { name: '\u200B', value: '\u200B', inline: true},

                    { name: UserManager.getUsernameWithBadges(orderedUsers.user1), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user1.id).length) + '\n\u200B', inline: true},
                    { name: `Deck${'     '.repeat((highestCardValue > 6) ? highestCardValue : 6)}Pile`, value: `<:cardback:740578642731597854>${'<:filler:740645434350895194>'.repeat((highestCardValue > 6) ? highestCardValue : (highestCardValue > 21) ? 21 : 6)} ${this.pile[this.pile.length - 1]}\n\u200B`, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },

                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user0), value: this.hands.get(orderedUsers.user0.id).toString().replace(/,/g, ''), inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },  
                )
            break;
    
            case 4:
                highestCardValue = Math.max(this.hands.get(orderedUsers.user0.id).length, this.hands.get(orderedUsers.user3.id).length) - 2

                privateGameEmbed.addFields(
                    { name: '\u200B', value: '\u200B', inline: true},
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user2), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user2.id).length) + '\n\u200B', inline: true},
                    { name: '\u200B', value: '\u200B', inline: true},

                    { name: UserManager.getUsernameWithBadges(orderedUsers.user1), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user1.id).length) + '\n\u200B', inline: true},
                    { name: `Deck${'     '.repeat((highestCardValue > 6) ? highestCardValue : 6)}Pile`, value: `<:cardback:740578642731597854>${'<:filler:740645434350895194>'.repeat((highestCardValue > 6) ? highestCardValue : (highestCardValue > 21) ? 21 : 6)} ${this.pile[this.pile.length - 1]}\n\u200B`, inline: true },
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user3), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user3.id).length) + '\n\u200B', inline: true},

                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user0), value: this.hands.get(orderedUsers.user0.id).toString().replace(/,/g, ''), inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },  
                )
            break;
            
            case 5:
                highestCardValue = Math.max(this.hands.get(orderedUsers.user0.id).length, this.hands.get(orderedUsers.user4.id).length) - 2

                privateGameEmbed.addFields(
                    { name: '\u200B', value: '\u200B', inline: true},
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user3), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user3.id).length) + '\n\u200B', inline: true},
                    { name: '\u200B', value: '\u200B', inline: true},

                    { name: UserManager.getUsernameWithBadges(orderedUsers.user2), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user2.id).length) + '\n\u200B', inline: true},
                    { name: `Deck${'     '.repeat((highestCardValue > 6) ? highestCardValue : 6)}Pile`, value: `<:cardback:740578642731597854>${'<:filler:740645434350895194>'.repeat((highestCardValue > 6) ? highestCardValue : (highestCardValue > 21) ? 21 : 6)} ${this.pile[this.pile.length - 1]}\n\u200B`, inline: true },     
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user4), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user4.id).length) + '\n\u200B', inline: true},

                    { name: UserManager.getUsernameWithBadges(orderedUsers.user1), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user1.id).length) + '\n\u200B', inline: true},
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user0), value: this.hands.get(orderedUsers.user0.id).toString().replace(/,/g, ''), inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },  
                )
            break;
    
            case 6:
                highestCardValue = Math.max(this.hands.get(orderedUsers.user0.id).length, this.hands.get(orderedUsers.user5.id).length) - 2

                privateGameEmbed.addFields(
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user3), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user3.id).length) + '\n\u200B', inline: true},
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user4), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user4.id).length) + '\n\u200B', inline: true},
                    { name: '\u200B', value: '\u200B', inline: true},

                    { name: UserManager.getUsernameWithBadges(orderedUsers.user2), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user2.id).length) + '\n\u200B', inline: true},
                    { name: `Deck${'     '.repeat((highestCardValue > 6) ? highestCardValue : 6)}Pile`, value: `<:cardback:740578642731597854>${'<:filler:740645434350895194>'.repeat((highestCardValue > 6) ? highestCardValue : (highestCardValue > 21) ? 21 : 6)} ${this.pile[this.pile.length - 1]}\n\u200B`, inline: true },     
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user5), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user5.id).length) + '\n\u200B', inline: true},

                    { name: UserManager.getUsernameWithBadges(orderedUsers.user1), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user1.id).length) + '\n\u200B', inline: true},
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user0), value: this.hands.get(orderedUsers.user0.id).toString().replace(/,/g, ''), inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },  
                )
            break;
    
            case 7:
                highestCardValue = Math.max(this.hands.get(orderedUsers.user0.id).length, this.hands.get(orderedUsers.user6.id).length) - 2

                privateGameEmbed.addFields(
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user3), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user3.id).length) + '\n\u200B', inline: true},
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user4), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user4.id).length) + '\n\u200B', inline: true},
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user5), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user5.id).length) + '\n\u200B', inline: true},

                    { name: UserManager.getUsernameWithBadges(orderedUsers.user2), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user2.id).length) + '\n\u200B', inline: true},
                    { name: `Deck${'     '.repeat((highestCardValue > 6) ? highestCardValue : 6)}Pile`, value: `<:cardback:740578642731597854>${'<:filler:740645434350895194>'.repeat((highestCardValue > 6) ? highestCardValue : (highestCardValue > 21) ? 21 : 6)} ${this.pile[this.pile.length - 1]}\n\u200B`, inline: true },     
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user6), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user6.id).length) + '\n\u200B', inline: true},

                    { name: UserManager.getUsernameWithBadges(orderedUsers.user1), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user1.id).length) + '\n\u200B', inline: true},
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user0), value: this.hands.get(orderedUsers.user0.id).toString().replace(/,/g, ''), inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },  
                )
            break;
    
            case 8:
                highestCardValue = Math.max(this.hands.get(orderedUsers.user0.id).length, this.hands.get(orderedUsers.user7.id).length) - 2

                privateGameEmbed.addFields(
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user3), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user3.id).length) + '\n\u200B', inline: true},
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user4), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user4.id).length) + '\n\u200B', inline: true},
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user5), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user5.id).length) + '\n\u200B', inline: true},

                    { name: UserManager.getUsernameWithBadges(orderedUsers.user2), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user2.id).length) + '\n\u200B', inline: true},
                    { name: `Deck${'     '.repeat((highestCardValue > 6) ? highestCardValue : 6)}Pile`, value: `<:cardback:740578642731597854>${'<:filler:740645434350895194>'.repeat((highestCardValue > 6) ? highestCardValue : (highestCardValue > 21) ? 21 : 6)} ${this.pile[this.pile.length - 1]}\n\u200B`, inline: true },     
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user6), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user6.id).length) + '\n\u200B', inline: true},

                    { name: UserManager.getUsernameWithBadges(orderedUsers.user1), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user1.id).length) + '\n\u200B', inline: true},
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user0), value: this.hands.get(orderedUsers.user0.id).toString().replace(/,/g, ''), inline: true },
                    { name: UserManager.getUsernameWithBadges(orderedUsers.user7), value: '<:cardback:740578642731597854>'.repeat(this.hands.get(orderedUsers.user7.id).length) + '\n\u200B', inline: true},
                )
            break;
        }

        if(this.dmMessages[0] != undefined && !this.dmMessages[0].deleted) {  
            await this.dmMessages[0].delete()
            this.dmMessages.shift()
        }

        orderedUsers.user0.send(privateGameEmbed).then(async sentMessage => {
            this.dmMessages.push(sentMessage);
            if(this.currentTurn == orderedUsers.user0) {
                for(let j = 0; j < this.hands.get(orderedUsers.user0.id).length; j++) {
                    if(determineIfCardsAreStackable(this.hands.get(orderedUsers.user0.id)[j], this.pile[this.pile.length - 1], this)) {
                        await sentMessage.react(this.hands.get(orderedUsers.user0.id)[j].split(':')[2].replace('>', ''))
                    }           
                }
                await sentMessage.react('740852082361499680')
                
                if(this.hands.get(orderedUsers.user0.id).length == 2 && sentMessage.reactions.cache.size >= 2) {
                    await sentMessage.react('❗')
                    sentMessage.awaitReactions((reaction, user) => { return reaction.emoji.name == '❗' && !user.bot}, { max: 1, time: 180000, errors: ['time'] })
                        .then(reaction => {
                            if(reaction.first()) {
                                this.didLastTurnSayUNO = true
                                this.announce(orderedUsers.user0, 'UNO!')
                            }
                        })
                        .catch(err => {
                            console.log(err)
                            orderedUsers.user0.send('You took too long to answer so I kicked you for being AFK')
                            this.users.splice(i, 1)
                            this.update()
                        })
                }

                if(this.hands.get(this.lastTurn.id).length == 1 && this.didLastTurnSayUNO == false) {
                    await sentMessage.react('❕')
                    sentMessage.awaitReactions((reaction, user) => {return reaction.emoji.name == '❕' && !user.bot}, { max: 1, time: 180000, errors: ['time'] })
                        .then(reaction => {
                            this.hands.get(this.lastTurn.id).push(this.deck.pop())
                            this.hands.get(this.lastTurn.id).push(this.deck.pop())
                            this.announce(main.client.user, `Oops ${this.lastTurn.tag} didn't say UNO! Yikes.`)
                        })
                        .catch(err => {
                            console.log(err)
                            orderedUsers.user0.send('You took too long to answer so I kicked you for being AFK')
                            this.users.splice(i, 1)
                            this.update()
                        })
                }

                sentMessage.awaitReactions((reaction, user) => { return cards.includes(`<:${reaction.emoji.name}:${reaction.emoji.id}>`) && user.bot === false }, { max: 1, time: 180000, errors: ['time'] })
                .then(reaction => {
                    if(reaction.first() == undefined) return;
                    let card = `<:${reaction.first().emoji.name}:${reaction.first().emoji.id}>`
                    let index = this.hands.get(orderedUsers.user0.id).indexOf(card)

                    if(reaction.first().emoji.name == 'grabcard') {
                        if(this.awaitingPenalties == 0)
                            this.hands.get(orderedUsers.user0.id).push(this.deck.pop())
                        else {
                            for(let j = 0; j < this.awaitingPenalties; j++) {
                                this.hands.get(orderedUsers.user0.id).push(this.deck.pop())
                            }
                            this.awaitingPenalties = 0
                        }
                        
                        this.update()
                        return
                    } else if(reaction.first().emoji.name.includes('reverse')) {
                        if(this.direction == 'clockwise')
                            this.direction = 'anticlockwise'
                        else this.direction = 'clockwise'
                    } else if(reaction.first().emoji.name.includes('plus')) {
                        this.awaitingPenalties += parseInt(reaction.first().emoji.name.split('plus')[1])
                    } else if(reaction.first().emoji.name.includes('skip')) {
                        this.lastTurn = this.currentTurn
                        if(this.direction == 'clockwise') {
                            if(this.users[this.users.indexOf(this.lastTurn) + 1] == undefined) {
                                this.currentTurn = this.users[0]
                            } else {
                                this.currentTurn = this.users[this.users.indexOf(this.lastTurn) + 1]
                            }
                        } else if(this.direction == 'anticlockwise') {
                            if(this.users[this.users.indexOf(this.lastTurn) - 1] == undefined) {
                                this.currentTurn = this.users[this.users.length - 1]   
                            } else {
                                this.currentTurn = this.users[this.users.indexOf(this.lastTurn) - 1]
                            }
                        }
                    } 

                    if(reaction.first().emoji.name.includes('wild')) {
                        this.hands.get(orderedUsers.user0.id).splice(index, 1)
                        let changeColorEmbed = new Discord.MessageEmbed()
                            .setColor(0x06ab00)
                            .setDescription('What do you want to change the color to?')
                        orderedUsers.user0.send(changeColorEmbed).then(async sentMessage => {
                            let emojis = ['🟦', '🟥', '🟨', '🟩'] // blue, red, yellow, green
                            emojis.forEach(async emoji => {
                                await sentMessage.react(emoji)
                            })
                
                            const filter = (reaction, user) => { return emojis.includes(reaction.emoji.name) && !user.bot }
                
                            sentMessage.awaitReactions(filter, { max: 1, time: 180000, errors: ['time'] })
                                .then(reaction => {
                                    switch(reaction.first().emoji.name) {
                                        case '🟦': //blue
                                            if(card.includes('color')) this.pile.push('<:bluecolor:740940219389313037>')
                                            else this.pile.push('<:blueplus4:740952344560402553>')
                                            this.announce(orderedUsers.user0, '**Changed the color to blue**')
                                        break;

                                        case '🟥': //red      
                                            if(card.includes('color')) this.pile.push('<:redcolor:740940123881078785>')
                                            else this.pile.push('<:redplus4:740952344560402553>')
                                            this.announce(orderedUsers.user0, '**Changed the color to red**')
                                        break;

                                        case '🟨': //yellow
                                            if(card.includes('color')) this.pile.push('<:yellowcolor:740940180885864490>')
                                            else this.pile.push('<:yellowplus4:740952344560402553>')
                                            this.announce(orderedUsers.user0, '**Changed the color to yellow**')
                                        break;

                                        case '🟩': //green
                                            if(card.includes('color')) this.pile.push('<:greencolor:740940260501880992>')
                                            else this.pile.push('<:greenplus4:740952344560402553>')
                                            this.announce(orderedUsers.user0, '**Changed the color to green**')
                                        break
                                    }

                                    index = -1
                                    sentMessage.delete().catch(err => console.log(err))

                                    finalUpdate(this)
                                })
                                .catch((err) => {
                                    console.log(err)
                                    orderedUsers.user0.send('You took too long to answer so I kicked you for being AFK')
                                    this.users.splice(i, 1)
                                    this.update()
                                })
                        })
                    } else {
                        finalUpdate(this)
                    }

                    function finalUpdate(game) {
                        if(index != -1) {
                            game.pile.push(game.hands.get(game.users[i].id).splice(index, 1)[0])       
                        }

                        if(game.hands.get(orderedUsers.user0.id).length > 1) {
                            game.didLastTurnSayUNO = false
                        }

                        if(game.hands.get(game.users[i].id).length == 0) {
                            game.endGame(game.users[i].tag + ' won!')
                        } else {
                            game.update()
                        }
                    }
                })
                .catch((err) => {
                    console.log(err)
                    orderedUsers.user0.send('You took too long to answer so I kicked you for being AFK')
                    this.users.splice(i, 1)
                    this.update()
                })
            }
        })
    }
}

Game.prototype.getUsersAsString = function() {
    let res = `${UserManager.getUsernameWithBadges(this.users[0])}`
    for(let i = 1; i < this.users.length; i++) {
        res += `\n${UserManager.getUsernameWithBadges(this.users[i])}`
    }
    return res
}

Game.prototype.endGame = function(message) {
    this.dmMessages.forEach(dm => {
        if(dm != undefined && !dm.deleted) {
            dm.delete()
            let gameEnd = new Discord.MessageEmbed()
                .setColor(0x06ab00)
                .setTitle('Game Ended!')
                .setDescription(message)
            dm.channel.send(gameEnd)
        }
    })
    games.splice(games.indexOf(this), 1)
}

Game.prototype.announce = function(author, string) {
    this.chat.push(`${author.tag}: ${string}`)
    this.dmMessages.forEach(dm => {
        let newEmbed = dm.embeds[0]
            newEmbed.setDescription(`${this.chat.toString().replace(/,/g, '\n')} \n\u200B`)
        dm.edit(newEmbed)
    })
}

module.exports = {
    Game: Game,
    games: games
}

function determineIfCardsAreStackable(card1, card2, game) {
    if(card1.includes('plus') && card2.includes('plus') && game.awaitingPenalties > 0 && game.settings.stackpenalties == false) {
        return false
    } else if(!card1.includes('plus') && card2.includes('plus') && game.awaitingPenalties > 0) {
        return false
    } else if(card1.includes('wild') || card2.includes('wild') && game.awaitingPenalties == 0) {
        return true
    } else if(card1.includes('plus') && card2.includes('plus') && game.awaitingPenalties > 0) {
        return true
    }

    let colors = ['red', 'green', 'yellow', 'blue']
    for(let i = 0; i < colors.length; i++) {
        if((card1.includes(colors[i]) && card2.includes(colors[i])) || card1.replace('yellow', '').replace('red', '').replace('green', '').replace('blue', '').split(':')[1] == card2.replace('yellow', '').replace('red', '').replace('green', '').replace('blue', '').split(':')[1]) {
            return true;
        }
    }

    return false;
}

function createDeck() {
    let cards = [
        '<:yellow0:740577264961323058>', '<:green0:740577264357605468>', '<:blue0:740577264936157224>', '<:red0:740577265007722566>',
        '<:yellow1:740577264877568001>', '<:green1:740577264550281359>', '<:blue1:740577264567320706>', '<:red1:740577264919380118>',
        '<:yellow2:740577264978362470>', '<:green2:740577264621846529>', '<:blue2:740577264651206660>', '<:red2:740577264437035022>',
        '<:yellow3:740577264898670654>', '<:green3:740577264327983195>', '<:blue3:740577264617521253>', '<:red3:740577264764452925>',
        '<:yellow4:740577264865116251>', '<:green4:740577264487628851>', '<:blue4:740577264583966750>', '<:red4:740577264458006591>',
        '<:yellow5:740577264827105300>', '<:green5:740577264613326919>', '<:blue5:740577264244359211>', '<:red5:740577264730898472>',
        '<:yellow6:740577264915185716>', '<:green6:740577264642818168>', '<:blue6:740577264647012352>', '<:red6:740577264789487636>',
        '<:yellow7:740577264881762416>', '<:green7:740577265045471292>', '<:blue7:740577264625909880>', '<:red7:740577264894476319>',
        '<:yellow8:740577265154523166>', '<:green8:740577264298885192>', '<:blue8:740577264181182495>', '<:red8:740577264567058483>',
        '<:yellow9:740577319751778414>', '<:green9:740577264726704238>', '<:blue9:740577264403480668>', '<:red9:740577264827236362>',
        '<:yellow0:740577264961323058>', '<:green0:740577264357605468>', '<:blue0:740577264936157224>', '<:red0:740577265007722566>',
        '<:yellow1:740577264877568001>', '<:green1:740577264550281359>', '<:blue1:740577264567320706>', '<:red1:740577264919380118>',
        '<:yellow2:740577264978362470>', '<:green2:740577264621846529>', '<:blue2:740577264651206660>', '<:red2:740577264437035022>',
        '<:yellow3:740577264898670654>', '<:green3:740577264327983195>', '<:blue3:740577264617521253>', '<:red3:740577264764452925>',
        '<:yellow4:740577264865116251>', '<:green4:740577264487628851>', '<:blue4:740577264583966750>', '<:red4:740577264458006591>',
        '<:yellow5:740577264827105300>', '<:green5:740577264613326919>', '<:blue5:740577264244359211>', '<:red5:740577264730898472>',
        '<:yellow6:740577264915185716>', '<:green6:740577264642818168>', '<:blue6:740577264647012352>', '<:red6:740577264789487636>',
        '<:yellow7:740577264881762416>', '<:green7:740577265045471292>', '<:blue7:740577264625909880>', '<:red7:740577264894476319>',
        '<:yellow8:740577265154523166>', '<:green8:740577264298885192>', '<:blue8:740577264181182495>', '<:red8:740577264567058483>',
        '<:yellow9:740577319751778414>', '<:green9:740577264726704238>', '<:blue9:740577264403480668>', '<:red9:740577264827236362>',
        '<:yellowskip:740577319378485370>', '<:greenskip:740577264651206710>', '<:blueskip:740577264705470515>', '<:redskip:740577264801939547>',
        '<:yellowskip:740577319378485370>', '<:greenskip:740577264651206710>', '<:blueskip:740577264705470515>', '<:redskip:740577264801939547>',
        '<:yellowplus2:740577319311376556>', '<:greenplus2:740577264369926144>', '<:blueplus2:740577264244228108>', '<:redplus2:740577264701407362>',
        '<:yellowplus2:740577319311376556>', '<:greenplus2:740577264369926144>', '<:blueplus2:740577264244228108>', '<:redplus2:740577264701407362>',
        '<:yellowreverse:740577319269171313>', '<:greenreverse:740577264709664778>', '<:bluereverse:740577264407806013>', '<:redreverse:740577264898408458>',
        '<:yellowreverse:740577319269171313>', '<:greenreverse:740577264709664778>', '<:bluereverse:740577264407806013>', '<:redreverse:740577264898408458>',
        '<:wildplus4:740577264923705434>', '<:wildplus4:740577264923705434>', '<:wildplus4:740577264923705434>', '<:wildplus4:740577264923705434>',
        '<:wildcolor:740577264869179463>', '<:wildcolor:740577264869179463>', '<:wildcolor:740577264869179463>', '<:wildcolor:740577264869179463>', 
    ]

    return cards.shuffle()
}

function createGameID() {
    let result = '';
    let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let charactersLength = characters.length;
    let uniqueFound = false

    while (!uniqueFound) {
        result = '';

        for (var i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        if(games.find(g => g.code === result) == undefined) {
            uniqueFound = true
        }
    }

    return result;
}

// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
Array.prototype.shuffle = function() {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
}