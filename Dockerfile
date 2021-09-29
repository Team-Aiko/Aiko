FROM node:latest

WORKDIR /Users/h.lee/docks

COPY package*.json ./

RUN npm install

COPY . ./

EXPOSE 80

CMD ["npm", "run", "dev"]