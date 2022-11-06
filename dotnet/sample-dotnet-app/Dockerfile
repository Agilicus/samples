FROM node:latest as angular
COPY TodoApp /app
WORKDIR /app
RUN npm ci \
 && node_modules/.bin/ng build

FROM mcr.microsoft.com/dotnet/core/sdk:2.2-alpine AS build
COPY TodoApi /app

WORKDIR /app

RUN dotnet restore 
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-alpine
LABEL maintainer="don@agilicus.com"

WORKDIR /app
COPY --from=build /app/out ./
COPY --from=angular /app/dist/TodoApp ./wwwroot
ENTRYPOINT ["dotnet", "TodoApi.dll"]

