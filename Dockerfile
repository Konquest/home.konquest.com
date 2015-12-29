FROM node:4.2

ADD . /usr/src/home
WORKDIR /usr/src/home

RUN npm install --production

CMD [ "npm", "run", "production" ]
