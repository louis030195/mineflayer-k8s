const argv = require('yargs/yargs')(process.argv.slice(2))
  .usage('Usage: $0 <command> [options]')
  .help('h')
  .option('config', {
    alias: 'c',
    type: 'string',
    default: 'default',
    description: 'Configuration file'
  })
  .argv

const mineflayer = require("mineflayer")
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const defaultSettings = require('./default')

let settings

try {
  console.log(`Trying to load config ${argv.config} ...`)
  settings = require(`./${argv.config}`)

  Object.keys(defaultSettings).forEach(settingKey => {
    if (settings[settingKey] === undefined) {
      settings[settingKey] = defaultSettings[settingKey]
    }
  })
  console.log(`Loaded custom settings, ${JSON.stringify(settings)}`)

} catch (err) {
  console.log(`Couldn't find custom settings, going for default ${err}`)
  settings = defaultSettings
}

const bot = settings.password !== 'offline' ? mineflayer.createBot({
    host: settings.host,
    port: parseInt(settings.port),
    username: settings.username,
    password: settings.password,
    version: settings.version
}) : mineflayer.createBot({
    host: settings.host,
    port: parseInt(settings.port),
    username: 'bot' + Math.random().toString(36).substring(7),
    version: settings.version
})
bot.on('login', () => {
    console.log('Connected')
})
bot.on('end', () => {
    console.log('Disconnected')
})
bot.loadPlugin(require('mineflayer-cmd').plugin)
bot.loadPlugin(require('./plugins/utils'))
bot.loadPlugin(require('./plugins/pvp'))
bot.loadPlugin(require('./plugins/chat'))
try {
  bot.loadPlugin(require('./plugins/chatToxicity'))
} catch (err) {
  console.log(`Architecture doesn't support TensorflowJS, err: ${err}`)
}
bot.loadPlugin(require('./plugins/move'))
bot.loadPlugin(pathfinder)
bot.loadPlugin(require('mineflayer-pvp').plugin)

bot.once('spawn', () => {
    bot.log(`I just spawned in ${bot.prettyVec3(bot.entity.position)}`)
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)

    // Command listener
    bot.on('chat', (username, message) => {
        if (message.startsWith('!') && username !== bot.username) {
            const command = message.substring(1)
            console.log(`${username} executes "${command}"`)
            bot.cmd.run(username, command, err => err.message ?? bot.log(err.message))
        }
    })
})


process.on('SIGTERM', () => {
  bot.log('SIGTERM signal received.')
  bot.quit('SIGTERM received')
})

process.on('SIGINT', () => { // CTRL-C
  bot.log('SIGINT signal received.')
  bot.quit('SIGINT received')
})