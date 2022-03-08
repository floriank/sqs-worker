build:
	docker-compose build

test: build
	docker-compose run --rm test npm run test

test-i: build
	docker-compose run --rm test ash

