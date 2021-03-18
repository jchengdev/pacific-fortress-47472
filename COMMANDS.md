# SCRIPTS

## DEV

$ BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") COMMIT=$(git rev-parse --short HEAD) docker-compose up -d

## PROD (HEROKU CONTAINER)

$ docker build -t warbler-api:latest --target=prod --build-arg CREATED_DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" --build-arg SOURCE_COMMIT="$(git rev-parse --short HEAD)" -f ./Dockerfile .
$ docker tag warbler-api:latest registry.heroku.com/pacific-fortress-47472/web
$ docker push registry.heroku.com/pacific-fortress-47472/web
$ heroku container:release web
