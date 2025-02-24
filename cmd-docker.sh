#!/bin/sh
docker-compose exec  --user=$(id -u):$(id -g) php bin/console "$@"