# OneFichier Downloader
Discord bot to download files.  
Available hosts : 
- 1fichier
- UpToBox

## Setup
`make init`
Don't forget to fill .env file with your API keys and Discord bot API key

## Launch
`make up`

## Launch as daemon
```bash
npm install -g forever
make forever-up
```

## Usage
`+dl https://1fichier.com/my_file` in Discord
