require('dotenv').config()

const { Command } = require('discord.js-commando');

const OneFichier = require('../../hosts/onefichier.js');

module.exports = class DownloadCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'download',
      aliases: ['dl'],
      group: 'datamanagement',
      memberName: 'download',
      description: 'Launch file download',
      clientPermissions: ['SEND_MESSAGES']
    })
  }
  
  async run(msg) {
    let postData = {
      'url': msg.content.replace('+dl ', '')
    }
    if(postData.url.includes("1fichier"))
    {
      await (new OneFichier).download(msg, postData)
    }
    else
    {
      msg.say("Désolé, l'hébergeur saisi n'est pas pris en compte actuellement.")
    }  
  }
}
