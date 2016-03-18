FROM mhart/alpine-node:4.4

ADD . /usr/src/home
WORKDIR /usr/src/home

RUN npm install --production

CMD [ "npm", "run", "production" ]
