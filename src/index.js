require('dotenv').config()

const path = require('path')

const { CommandoClient } = require('discord.js-commando')

const client = new CommandoClient({
  commandPrefix: '+',
  owner: '206863244793479178'
})

client.registry
  .registerDefaultTypes()
  .registerGroups([
    [ 'datamanagement', 'Data Management' ]
  ])
  .registerCommandsIn(path.join(__dirname, 'commands'))

client.once('ready', () => {
  console.log('Bot ready')
})

client.on('error', console.error)

client.login(process.env.DISCORD_KEY)
