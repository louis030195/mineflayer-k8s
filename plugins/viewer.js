module.exports = function (bot, options) {
  const mineflayerViewer = require('prismarine-viewer').mineflayer
  bot.once('spawn', () => {
    mineflayerViewer(bot, { port: 3000 })
    // Draw the path followed by the bot
    // const path = [bot.entity.position.clone()]
    // bot.on('move', () => {
    //   if (path[path.length - 1].distanceTo(bot.entity.position) > 1) {
    //     path.push(bot.entity.position.clone())
    //     bot.viewer.drawLine('path', path)
    //   }
    // })
  })
}
