module.exports = function (bot, options) {
  try {
    const mineflayerViewer = require('prismarine-viewer').mineflayer
    bot.once('spawn', () => {
      // TODO: PR mineflayer viewer twitch support
      mineflayerViewer(bot, options.twitch && options.streamKey !== undefined
        ? { output: `rtmp://live-prg.twitch.tv/app/${options.streamKey}`, frames: 30, width: 512, height: 512 }
        : { port: 3000 }
      )
      // Draw the path followed by the bot
      if (options.drawPath) {
        const path = [bot.entity.position.clone()]
        bot.on('move', () => {
          if (path[path.length - 1].distanceTo(bot.entity.position) > 1) {
            path.push(bot.entity.position.clone())
            bot.viewer.drawLine('path', path)
          }
        })
      }
    })
  } catch (err) { // Happen
    bot.log(`Couldn't load prismarine-viewer: ${err}${options.twitch ? 'check the stream key you put in config' : ''}`,
      undefined, true)
  }
}
