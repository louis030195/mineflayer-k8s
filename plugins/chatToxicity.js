// Tensorflow
require('@tensorflow/tfjs')
require('@tensorflow/tfjs-node')
const toxicity = require('@tensorflow-models/toxicity')

module.exports = function (bot, options) {
    bot.detectToxicity = async (username, sentence) => {
        const threshold = 0.9
        const model = await toxicity.load(threshold)
        const labels = model.model.outputNodes.map(d => d.split('/')[0])
        const results = await model.classify([sentence])
        if (results.length == 0) return
        console.log(`${username} said ${sentence}`)
        // console.log(JSON.stringify(results))
        results.forEach((classification) => {
            if (classification.results[0].match === true) {
                bot.log(`${username} is toxic !`)
                bot.log(`${classification.label}:${classification.results[0].match}`)
            }
        })
    }

    bot.on('chat', (username, message) => {
        if (username === bot.username) return // TODO: fix (whispers seems to ignore this if)
        bot.detectToxicity(username, message)
    })
}