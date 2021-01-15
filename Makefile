.env:
	[ ! -f .env ] cp .env.example .env

init: .env
	npm install

up:
	node src/index.js

forever-up:
	forever start src/index.js
