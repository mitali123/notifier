FROM node:12

#ENV host=172.17.0.1
ENV port=3306
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app
COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .



# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
#RUN npx sequelize db:migrate

EXPOSE 3002
CMD [ "npm", "start" ]
