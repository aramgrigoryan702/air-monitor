#!/bin/bash
set -e
sleep 2
## if docker swarm not setup pls run  the following command
## docker swarm init
## docker service rm registry
## docker service create --name registry --publish published=5000,target=5000 registry:2
#docker stack rm services canary_frontend
sleep 2
#docker-compose build dockerfiles/nginx/Dockerfilestaging   --force-rm
docker build --force-rm -t 127.0.0.1:7000/canary-frontend:latest  -f dockerfiles/nginx/Dockerfilelocal .
sleep 2
docker stack deploy  -c docker-compose-local.yml canary_frontend --resolve-image "never" --prune
sleep 5
docker kill $(docker ps -f name=canary_frontend -q)
sleep 5
#docker system prune -f
#docker system prune --volumes -f
sleep 5
docker stack services canary_frontend