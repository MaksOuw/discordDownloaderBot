.env:
	cp .env.example .env

init: .env
	npm install

up:
	node src/index.js
