module.exports = function (bot, options) {
    bot.on('playerJoined', player => player.username !== bot.username ?? bot.log(`Welcome ${player.username}`))
}