FROM node:latest AS appbuild
COPY . /diseaseXpress
WORKDIR /diseaseXpress
EXPOSE 80
RUN npm install && npm rebuild node-sass && npm run build && npm install pushstate-server -g
CMD pushstate-server -d dist -p 80