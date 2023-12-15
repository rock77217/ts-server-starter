FROM node:18.17.0 as base

USER node

WORKDIR /srv/app/node_modules
WORKDIR /srv/app/dist
WORKDIR /srv/app

COPY --chown=node:node ./package.json ./

RUN yarn

ARG LOG_DIR
RUN mkdir -p ${LOG_DIR}

FROM base as prod
CMD [ "yarn", "start" ]

FROM base as dev
CMD [ "yarn", "dev" ]
