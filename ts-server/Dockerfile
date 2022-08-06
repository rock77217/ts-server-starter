FROM node:16.15.0 as base

USER node

WORKDIR /srv/app/dist
WORKDIR /srv/app

COPY ./package.json ./

RUN yarn

FROM base as prod
CMD [ "yarn", "start" ]

FROM base as dev
CMD [ "yarn", "dev" ]
