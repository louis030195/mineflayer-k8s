module.exports = function (bot, options) {
    const winston = require('winston')
    const logger = winston.createLogger()
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }))


    bot.on('kicked', reason => console.log(`got kicked ${reason}`))
    bot.log = (msg, destination) => {
        if (msg === undefined) return
        if (destination === undefined) {
            logger.info(`{ "message": "${msg}"}`)
            bot.chat(msg)
        } else {
            logger.info(`{ "whisper": "${destination}", "message": "${msg}"}`)
            bot.whisper(destination, msg)
        }
    }
    bot.prettyVec3 = p => `x:${p.x.toFixed(1)};y:${p.y.toFixed(1)};z:${p.z.toFixed(1)}`
    bot.assistMessage = (username) =>
        `Hello my dear ${username !== undefined ? username : ""} I'm your personnal assistant, say "come" and I'll come at you
    say "guard" and I'll defend around your position, say "stop" and I'll stop guarding this position.`


    announcePlayers = {}
    bot.on('physicTick', () => {
        entity = bot.nearestEntity(e => e.type === 'player' && e.position.distanceTo(bot.entity.position) < 16)
        if (entity && !announcePlayers[entity.username]) {
            bot.whisper(entity.username,
                `Hello ${entity.username} try !help to see what I can be useful for.`)
            announcePlayers[entity.username] = true // Just announce once, behavior could change ?
        }
    })

    function helpCommand(sender, flags, args, cb) {
        bot.whisper(sender, `I propose you these services, remember to add "!" before a command`)
        const prettyFlag = flags => flags.length > 0 ? `flags=${c.flags.map(f => f.name + "argCount " + f.argCount)}` : ''
        const prettyCommands = bot.cmd.commands.map(c => `\t"command=${c.name}" ${prettyFlag(c.flags)}`).join('\n')
        bot.whisper(sender, `${prettyCommands}`)
        cb()
    }

    // function stopHelpCommand(sender, flags, args, cb) {
    //     bot.whisper(sender, `Understood, I will stop bothering you with my services`)
    //     announcePlayers[sender] = true
    //     cb()
    // }

    bot.once('cmd_ready', () => {
        bot.cmd.registerCommand('help', helpCommand)
        // bot.cmd.registerCommand('help.stop', helpCommand)
    })

    bot.on('spawn', () => helpCommand(undefined, undefined, undefined, () => { }))
}