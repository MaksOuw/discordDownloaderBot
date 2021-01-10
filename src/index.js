require('dotenv').config()

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

let postData = {
  'url': "https://1fichier.com/?eig8l6wbpnx27kqd91dm"
};

(async() => {
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
    console.log('Erreur durant le fetch API');
  }
  else
  {
    console.log("Start downloading " + file.filename + "...")
    const output = fs.createWriteStream("data/"+file.filename)
    let responseData = ''
    let lastPercent = 0
    const download = https.get(json.url, (response) => {
      responseLength = response.headers['content-length']
      length = []

      response.on('data', (d) => {
        responseData += d
        length.push(d.length)
        let sum = length.reduce((a, b) => a + b, 0);
        let completedPercentage = Math.floor((sum / responseLength) * 100)
        if(completedPercentage > lastPercent) {
	  console.log(`${completedPercentage} % downloaded`)
          lastPercent = completedPercentage
	}
      })
      response.on('end', () => output.write(responseData))
    })
  }
})();
