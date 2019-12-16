#!/bin/bash
set -e
sleep 2
#docker stack rm services canary_frontend
sleep 2
docker-compose build --force-rm
sleep 2
docker stack deploy  -c docker-compose.yml canary_frontend --resolve-image "never" --prune
sleep 5
docker kill $(docker ps -f name=canary_frontend -q)
sleep 5
#docker system prune -f
#docker system prune --volumes -f
sleep 5
docker stack services canary_frontend