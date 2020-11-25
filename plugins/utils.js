const { Movements } = require('mineflayer-pathfinder')

module.exports = function (bot, options) {
  bot.on('death', () => {
    bot.log('Unfortunately, I died !')
    // TODO // https://github.com/PrismarineJS/mineflayer-pathfinder/issues/53
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)
    /// ///////
    bot.pathfinder.setGoal(null)
  })
  bot.on('kicked', reason => console.log(`got kicked ${reason}`))
  bot.log = (msg, destination, consoleOnly) => {
    if (msg === undefined) return
    if (destination === undefined) {
      bot.logger.info(`{ "message": "${msg}"}`)
      if (!consoleOnly) bot.chat(msg)
    } else {
      bot.logger.info(`{ "whisper": "${destination}", "message": "${msg}"}`)
      if (!consoleOnly) bot.whisper(destination, msg)
    }
  }
  bot.prettyVec3 = p => `x:${p.x.toFixed(1)};y:${p.y.toFixed(1)};z:${p.z.toFixed(1)}`
  bot.assistMessage = (username) =>
        `Hello my dear ${username !== undefined ? username : ''} I'm your personnal assistant, say "come" and I'll come at you
    say "guard" and I'll defend around your position, say "stop" and I'll stop guarding this position.`

  // announcePlayers = {}
  // bot.on('physicTick', () => {
  //     entity = bot.nearestEntity(e => e.type === 'player' && e.position.distanceTo(bot.entity.position) < 16)
  //     if (entity && !announcePlayers[entity.username]) {
  //         bot.whisper(entity.username,
  //             `Hello ${entity.username} try !help to see what I can be useful for.`)
  //         announcePlayers[entity.username] = true // Just announce once, behavior could change ?
  //     }
  // })

  //   const prettyFlag = flags => flags.length > 0 ? `flags=${c.flags.map(f => f.name + 'argCount ' + f.argCount)}` : ''
  //   const prettyHelp = help => help ? `help=${help}` : ''
  function helpCommand (sender, flags, args, cb) {
    bot.whisper(sender, 'I propose you these services, remember to add "!" before a command')
    // const prettyCommands = bot.cmd.commands.map(c => `\t"command=${c.name}" ${prettyFlag(c.flags)} ${prettyHelp(c.help)}`).join('\n')
    const prettyCommands = bot.cmd.commands.map(c => `${c.name}`).join(',')
    bot.whisper(sender, `${prettyCommands}`)
    cb()
  }

  // function stopHelpCommand(sender, flags, args, cb) {
  //     bot.whisper(sender, `Understood, I will stop bothering you with my services`)
  //     announcePlayers[sender] = true
  //     cb()
  // }

  function informationPositionCommand (sender, flags, args, cb) {
    bot.log(`My position is ${bot.prettyVec3(bot.entity.position)}`)
    cb()
  }

  function informationHealthCommand (sender, flags, args, cb) {
    bot.log(`I have ${bot.health} health`)
    cb()
  }

  function informationFoodCommand (sender, flags, args, cb) {
    bot.log(`I have ${bot.food} food`)
    cb()
  }

  // function informationNearestEntityCommand(sender, flags, args, cb) {
  //     const entity = bot.nearestEntity(e => e.type === 'player' && e.position.distanceTo(bot.entity.position) < 16)

  //     bot.log(`I have ${bot.food} food`)
  //     cb()
  // }
  bot.once('cmd_ready', () => {
    bot.cmd.registerCommand('help', helpCommand)
    bot.cmd.registerCommand('info.pos', informationPositionCommand)
    bot.cmd.registerCommand('info.health', informationHealthCommand)
    bot.cmd.registerCommand('info.food', informationFoodCommand)
    // bot.cmd.registerCommand('help.stop', stopHelpCommand)
  })

  bot.on('spawn', () => helpCommand(undefined, undefined, undefined, () => { }))
}
