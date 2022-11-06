FROM node:latest as build
COPY ./ /app
WORKDIR /app
RUN npm ci \
 && node_modules/.bin/ng build

FROM node:latest

COPY --from=build /app/dist /app/dist
RUN mkdir -p /app/api
ADD  ./api /app/api

WORKDIR /app/api
RUN npm install
EXPOSE 4000

CMD ["node", "server.js"]
