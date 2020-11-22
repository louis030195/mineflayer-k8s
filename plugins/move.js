const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

module.exports = function (bot, options) {
    function goCommand(sender, flags, args, cb) {
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

    bot.once('cmd_ready', () => {
        bot.cmd.registerCommand('go.here', goCommand)
    })
}