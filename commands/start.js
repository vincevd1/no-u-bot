const GameManager = require('../managers/GameManager.js')

module.exports = {
    name: 'start',
    description: "Start the UNO game",

    execute(client, message, args) {
        let game = GameManager.games.find(g => g.author === message.author)

        if(game != undefined) {
            if(game.users.length >= 2) {
                game.isStarted = true
                game.currentTurn = message.author
                for(let i = 0; i < 7; i++) {
                    for(let j = 0; j < game.users.length; j++) {
                        game.hands.get(game.users[j].id).push(game.deck.pop())
                    }
                }
                game.pile.push(game.deck.pop())
                game.dmMessages = []
                game.update()
            } else message.reply('You need atleast 2 players to play the game')
        } else message.reply("You haven't created any games!")
    }
}