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

const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const defaultSettings = require('./default')

let settings
const winston = require('winston')
const logger = winston.createLogger()
logger.add(new winston.transports.Console({
  format: winston.format.simple()
}))
try {
  logger.info(`Trying to load config ${argv.config} ...`)
  settings = require(`./${argv.config}`)

  Object.keys(defaultSettings).forEach(settingKey => {
    if (settings[settingKey] === undefined) {
      settings[settingKey] = defaultSettings[settingKey]
    }
  })
  logger.info(`Loaded custom settings, ${JSON.stringify(settings)}`)
} catch (err) {
  logger.info(`Couldn't find custom settings, going for default ${err}`)
  settings = defaultSettings
}

function login () {
  const bot = settings.password !== 'offline'
    ? mineflayer.createBot({
        host: settings.host,
        port: parseInt(settings.port),
        username: settings.username,
        password: settings.password,
        version: settings.version
      })
    : mineflayer.createBot({
      host: settings.host,
      port: parseInt(settings.port),
      username: settings.username ? settings.username : 'bot' + Math.random().toString(36).substring(7),
      version: settings.version
    })
  bot.logger = logger
  bot.on('login', () => {
    bot.log('Connected', undefined, true)
  })
  bot.on('end', () => {
    bot.log('Disconnected', undefined, true)
    setTimeout(login, 5000)
  })
  bot.on('error', err => {
    bot.log(`Error: ${err}`, undefined, true)
  })
  bot.loadPlugin(require('mineflayer-cmd').plugin)
  bot.loadPlugin(require('./plugins/utils'))
  bot.loadPlugin(require('./plugins/pvp'))
  bot.loadPlugin(require('./plugins/chat'))
  try {
    bot.loadPlugin(require('./plugins/chatToxicity'))
  } catch (err) {
    bot.log(`Architecture doesn't support TensorflowJS, err: ${err}`, undefined, true)
  }
  bot.loadPlugin(require('./plugins/move'))
  bot.loadPlugin(pathfinder)
  bot.loadPlugin(require('mineflayer-pvp').plugin)

  bot.on('spawn', () => {
    bot.log(`I just spawned in ${bot.prettyVec3(bot.entity.position)}`)
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(null)
  })
  // Command listener
  bot.on('chat', (username, message) => {
    if (message.startsWith('!') && username !== bot.username) {
      const command = message.substring(1)
      bot.log(`${username} executes "${command}"`, undefined, true)
      bot.cmd.run(username, command, err => err.message ?? bot.log(err.message))
    }
  })
  return bot
}

const bot = login()
process.on('SIGTERM', () => {
  bot.log('My master unplugged me, bye !')
  bot.quit('SIGTERM received')
  process.exit(1)
})

process.on('SIGINT', () => { // CTRL-C
  bot.log('My master unplugged me, bye !')
  bot.quit('SIGINT received')
  process.exit(1)
})
