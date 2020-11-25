module.exports = function (bot, options) {
  bot.on('playerJoined', player => {
    if (player.username !== bot.username) {
      bot.whisper(player.username, `Hello ${player.username} try !help to see what I can be useful for.`)
    }
  })
}
