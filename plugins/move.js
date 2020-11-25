const { goals } = require('mineflayer-pathfinder')

module.exports = function (bot, options) {
  function goHereCommand (sender, flags, args, cb) {
    const p = bot.players[sender]

    if (!p || !p.entity) {
      bot.log('I can\'t see you, you are too far problably.')
      return
    }
    bot.stopGuarding()
    bot.log('I\'m coming now')
    const pos = p.entity.position
    bot.pathfinder.setGoal(new goals.GoalNear(pos.x, pos.y, pos.z, 1))
    cb()
  }

  function goFollowCommand (sender, flags, args, cb) {
    const p = bot.players[sender]

    if (!p || !p.entity) {
      bot.log('I can\'t see you, you are too far problably.')
      return
    }
    bot.stopGuarding()
    bot.log('I\'m following you now')
    bot.pathfinder.setGoal(new goals.GoalFollow(p.entity, 3))
    cb()
  }

  // function goAtCommand(sender, flags, args, cb) {
  //     let pos
  //     if (flags.pos) pos = flags.pos.split(';')
  //     else return
  //     if (pos.length !== 3) {
  //         bot.log('Invalid given position, format: "!go.at 12.32;22;45"')
  //         return
  //     }
  //     bot.stopGuarding()
  //     bot.log(`Going to ${flags.pos}`)
  //     bot.pathfinder.setGoal(new goals.GoalNear(pos[0], pos[1], pos[2], 1))
  //     cb()
  //   }

  function goStopCommand (sender, flags, args, cb) {
    const p = bot.players[sender]

    if (!p || !p.entity) {
      bot.log('I can\'t see you, you are too far problably.')
      return
    }
    bot.stopGuarding()
    bot.log('I\'ll stop moving now')
    bot.pathfinder.setGoal(null)
    cb()
  }

  bot.once('cmd_ready', () => {
    bot.cmd.registerCommand('go.here', goHereCommand, 'Reach my position')
    bot.cmd.registerCommand('go.follow', goFollowCommand, 'Reach my position')
    // TODO
    // bot.cmd.registerCommand('go.at', goAtCommand, 'Reach given position').addFlag('pos', 1)
    bot.cmd.registerCommand('go.stop', goStopCommand, 'Stop moving')
  })
}
