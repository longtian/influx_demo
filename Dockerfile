FROM node:4.0.0
MAINTAINER wyvernnot wyvernnot@users.noreply.github.com
COPY . .
RUN npm install
EXPOSE 8888
CMD ["npm","start"]