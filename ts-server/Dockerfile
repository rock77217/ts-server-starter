FROM node:16.17.0 as base

USER node

WORKDIR /srv/app/ssl
RUN openssl req -x509 -sha256 -nodes -days 36500 -newkey rsa:2048 -subj "/C=TW/ST=Taipei/L=Taipei/O=MY/OU=MY/CN=MY" -keyout private.key -out certificate.crt

WORKDIR /srv/app/node_modules
WORKDIR /srv/app/dist
WORKDIR /srv/app

COPY ./package.json ./

RUN yarn

ARG LOG_DIR
RUN mkdir -p ${LOG_DIR}

FROM base as prod
CMD [ "yarn", "start" ]

FROM base as dev
CMD [ "yarn", "dev" ]
