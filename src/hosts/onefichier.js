require('dotenv').config()

const fetch = require('node-fetch')
const fs = require('fs')
const request = require('request')
const progress = require('request-progress')

const apiKey = process.env.ONEFICHIER_API_KEY
const tokenApiUrl = "https://api.1fichier.com/v1/download/get_token.cgi"
const fileinfoApiUrl = "https://api.1fichier.com/v1/file/info.cgi"

const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + apiKey
}

module.exports = class OneFichier {
  async download(msg, postData) {
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
      const progressMsg = await msg.say('Avancement : 0%')
      const output = fs.createWriteStream("data/"+file.filename)
      let lastPercent = 0
      const download = progress(request(json.url), {})
        .on('progress', (state) => {
          let percentage = Math.trunc(state.percent * 100)
          let speed = Math.trunc(state.speed / 1000)
          if(percentage > lastPercent)
          {
            progressMsg.edit(`Avancement : ${percentage}% - ${speed} kb/s - Reste ${state.time.remaining}s`)
            console.log(`Avancement : ${percentage}% - ${speed} kb/s - Reste ${state.time.remaining}s`)
            lastPercent = percentage
	        }
	      })
        .on('error', (error) => {
          console.log(error)
          msg.say(error)
	      })
        .on('end', () => {
          progressMsg.edit(`Avancement : 100%`)
          console.log('Avancement : 100%')
          msg.say('<@' + msg.author.id + '>: Téléchargement de ' + file.filename + ' terminé')
	      })
        .pipe(output)
    }
  }
}