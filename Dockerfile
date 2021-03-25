FROM node:14.16.0-alpine as base 
ARG CREATED_DATE=not-set 
ARG SOURCE_COMMIT=not-set 
LABEL org.opencontainers.image.authors=jcheng.deveng@gmail.com
LABEL org.opencontainers.image.created=$CREATED_DATE 
LABEL org.opencontainers.image.revision=$SOURCE_COMMIT 
LABEL org.opencontainers.image.title="Warbler API - Node+Express sample" 
LABEL org.opencontainers.image.licenses=MIT 
EXPOSE 8081 
ENV NODE_VERSION=14.16.0
ENV NODE_ENV=production
ENV DEBUG=*,-request:*
ENV DATABASE_URL=mongodb+srv://user:pass@instance.url/warbler?retryWrites=true&w=majority
ENV SECRET_KEY=some-key-to-use
ENV PORT=8081
RUN mkdir /node && chown -R node:node /node
USER node
WORKDIR /node
COPY package*.json ./ 
RUN npm config list \ 
  && npm ci \ 
  && npm cache clean --force

FROM base as dev 
ENV NODE_ENV=development 
ENV PATH=/node/node_modules/.bin:$PATH 
WORKDIR /node 
RUN npm install --only=development 
WORKDIR /node/app 
CMD ["nodemon", "./index.js", "--inspect=0.0.0.0:9229"]

FROM base as source 
RUN mkdir /node/app && chown -R node:node /node/app
WORKDIR /node/app
COPY --chown=node:node . .
RUN sed -i "s~%%COMMIT_SHA%%~$SOURCE_COMMIT~g" ./about.html

# FROM source as test 
# ENV NODE_ENV=development 
# ENV PATH=/node/node_modules/.bin:$PATH 
# COPY --from=dev /node/node_modules /node/node_modules
# # RUN eslint .  
# # RUN npm test 
# CMD ["npm", "run", "int-test"]

# FROM test as audit 
FROM source as audit
RUN npm audit --audit-level=high
# hadolint ignore=DL3002
USER root
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN apk update && apk add --no-cache curl=7.55.0-r2 \ 
  && curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin \ 
  && trivy filesystem --exit-code 1 --no-progress / \
  && rm -rf /var/cache/apk/*

FROM source as prod
CMD [ "node", "./index.js" ]