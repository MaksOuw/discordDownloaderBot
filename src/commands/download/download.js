require('dotenv').config()

const Discord = require('discord.js')
const { Command } = require('discord.js-commando');

const fetch = require('node-fetch')
const https = require('https')
const fs = require('fs')

const apiKey = process.env.API_KEY
const tokenApiUrl = "https://api.1fichier.com/v1/download/get_token.cgi"
const fileinfoApiUrl = "https://api.1fichier.com/v1/file/info.cgi"

const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + apiKey
}

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
    const fileInfo = await fetch(fileinfoApiUrl, {
      method: 'POST',
      body: JSON.stringify(postData),
      headers: headers
    })
    const file = await fileInfo.json()
    const response = await fetch(tokenApiUrl, {
      method: 'POST',
      body: JSON.stringify(postData),
      headers: headers
    })
    const json = await response.json()
    if(json.status === "KO")
    {
      console.log('Erreur durant le fetch API (url: ' + postData['url'] + ')')
      msg.say('Erreur durant le fetch API : ' + json.message)
    }
    else
    {
      console.log("Start downloading " + file.filename + "...")
      msg.say('Téléchargement de ' + file.filename + ' en cours')
      const progress = await msg.say('Avancement : 0%')
      const output = fs.createWriteStream("data/"+file.filename)
      let responseData = ''
      let lastPercent = 0
      const download = https.get(json.url, (response) => {
        let responseLength = response.headers['content-length']
        let length = []

        response.on('data', (d) => {
          responseData += d
          length.push(d.length)
          let sum = length.reduce((a, b) => a + b, 0);
          let completedPercentage = Math.floor((sum / responseLength) * 100)
          if(completedPercentage > lastPercent) {
            console.log(`${completedPercentage} % downloaded`)
            progress.edit(`Avancement : ${completedPercentage}%`)
            lastPercent = completedPercentage
          }
        })
        response.on('end', () => {
          output.write(responseData)
          msg.say('<@' + msg.author.id + '>: Téléchargement de ' + file.filename + ' terminé')
	})
      })
    }  
  }
}
