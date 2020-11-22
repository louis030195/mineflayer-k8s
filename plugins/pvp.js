const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

module.exports = function (bot, options) {
    let guardPos = null

    // Assign the given location to be guarded
    bot.guardArea = (pos) => {
        bot.log(`I will guard ${bot.prettyVec3(pos)}.`)
        guardPos = pos

        // We we are not currently in combat, move to the guard pos
        if (!bot.pvp.target) bot.moveToGuardPos()
    }

    function guardCommand(sender, flags, args, cb) {
        const p = bot.players[sender]
        if (!p || !p.entity) {
            bot.log('I can\'t see you, you are too far problably.')
            return
        }
        bot.guardArea(p.entity.position)
        cb()
    }

    // Cancel all pathfinder and combat
    bot.stopGuarding = () => {
        if (guardPos) bot.log(`I will no longer guard ${bot.prettyVec3(guardPos)}`)
        guardPos = null
        bot.pvp.stop()
        bot.pathfinder.setGoal(null)
    }


    function stopGuardCommand(sender, flags, args, cb) {
        bot.stopGuarding()
        cb()
    }

    // Pathfinder to the guard position
    bot.moveToGuardPos = () => {
        bot.pathfinder.setGoal(new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z))
    }

    // Check for new enemies to attack
    bot.on('physicTick', () => {
        if (!guardPos) return // Do nothing if bot is not guarding anything

        // Only look for mobs within 16 blocks
        const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 16 &&
            e.mobType !== 'Armor Stand' // Mojang classifies armor stands as mobs for some reason?

        let entity = bot.nearestEntity(filter)
        if (entity) {
            // log(`Enemy detected, I'll try to kill ${entity.name}`)
            // Start attacking
            bot.pvp.attack(entity)
        }
    })

    bot.once('cmd_ready', () => {
        bot.cmd.registerCommand('guard.here', guardCommand)
        bot.cmd.registerCommand('guard.stop', stopGuardCommand)
    })

    // Called when the bot has killed it's target.
    bot.on('stoppedAttacking', () => {
        if (guardPos) {
            bot.moveToGuardPos()
        }
    })

    let lastStartedAttackingAnnouncement = new Date()
    bot.on('startedAttacking', () => {
        // Avoid spamming announcement
        if (new Date() - lastStartedAttackingAnnouncement < 2000) return
        lastStartedAttackingAnnouncement = new Date()
        const n = bot.target ? bot.target.username ? bot.target.username : bot.target.name : 'something'
        // console.log(bot.target)
        // api broken bot.target always undefined
        bot.log(`I'm attacking ${bot.target ? bot.target : 'something'}`)
    })

    bot.on('entityHurt', entity => {
        if (entity.type === 'player' && entity.health < 2) bot.log(`${entity.username} is on the verge of death, save him !`)
    })
}