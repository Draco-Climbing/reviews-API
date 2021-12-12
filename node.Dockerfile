FROM node:latest

ENV MONGO_CONNECTION='sdc-mongo' MONGO_DB='sdc' MONGOIP='18.118.106.168'

WORKDIR /src

COPY . /src

RUN npm install

EXPOSE 8080

CMD npm start