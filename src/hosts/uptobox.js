require('dotenv').config()

const fetch = require('node-fetch')
const fs = require('fs')
const request = require('request')
const progress = require('request-progress')

const apiKey = process.env.UPTOBOX_API_KEY
const uptoboxUrl = "https://uptobox.com/"
const tokenApiUrl = "https://uptobox.com/api/link"
const fileinfoApiUrl = "https://uptobox.com/api/link/info"

module.exports = class UpToBox {
  async download(msg, postData) {
    const fileCode = postData.url.replace(uptoboxUrl, '')
    const fileInfo = await fetch(fileinfoApiUrl + `?fileCodes=${fileCode}`)
    const fileJson = await fileInfo.json()
    if(fileJson.data.list[0].error)
    {
      console.log('An error has occured')
      console.log(fileJson.data.list[0].error.message)
      return msg.say('Une erreur est survenue, le fichier ne semble pas exister')
    }
    const file = {
      filename: fileJson.data.list[0].file_name
    }
    let response = await fetch(tokenApiUrl + `?token=${apiKey}&file_code=${fileCode}`)
    let json = await response.json()
    if(json.statusCode === 7)
    {
      console.log("File has not been found")
      return msg.say("Le fichier n'a pas été trouvé")
    }

    if(json.data.waiting && json.data.waiting > 0)
    {
      console.log('Waiting 30 seconds because of free account')
      msg.say("Attente de 30 secondes nécessaire car compte gratuit")
      await this.wait(31000)
      console.log("Finish waiting, getting download URL")
      msg.say('Attente terminée, récupération du lien de téléchargement')
      const waitingToken = json.data.waitingToken
      response = await fetch(tokenApiUrl + `?token=${apiKey}&file_code=${fileCode}&waitingToken=${waitingToken}`)
      json = await response.json()
    }

    if(! json.data.dlLink)
    {
      console.log("Error during download link generation")
      return msg.say("Erreur durant la génération du lien de téléchargement")
    }
    else
    {
      console.log("Start downloading " + file.filename + "...")
      msg.say('Téléchargement de ' + file.filename + ' en cours')
      const progressMsg = await msg.say('Avancement : 0%')
      const output = fs.createWriteStream("data/"+file.filename)
      let lastPercent = 0
      const download = progress(request(json.data.dlLink), {})
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
  async wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}