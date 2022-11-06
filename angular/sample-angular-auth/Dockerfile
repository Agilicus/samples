FROM node:16 as frontend
MAINTAINER dev@agilicus.com

COPY *.json /web/
COPY src /web/src/
WORKDIR /web

ARG REGISTRY=https://npmcache.agilicus.ca/

RUN npm config set registry $REGISTRY

ARG CI_JOB_TOKEN

RUN : \
 && echo @agilicus:registry=https://git.agilicus.com/api/v4/packages/npm/ > .npmrc \
 && echo //git.agilicus.com/api/v4/packages/npm/:_authToken=\${CI_JOB_TOKEN} >> .npmrc \
 && npm ci \
 && ./node_modules/.bin/ng build --aot --subresource-integrity --output-hashing=all --prod=true \
&& rm -f .npmrc


RUN npm ci && \
    ./node_modules/.bin/ng build --aot --subresourceIntegrity --outputHashing=all --prod=true

FROM cr.agilicus.com/open-source/openresty:v0.12.12
LABEL maintainer="Agilicus Devs <dev@agilicus.com>"

COPY --from=frontend /web/dist/sample-angular-auth /app/

ENV HDR_CONTENT_SECURITY_POLICY="default-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https://www.gravatar.com https://storage.googleapis.com www.googletagmanager.com https://www.google-analytics.com data:; font-src 'self' https://fonts.gstatic.com; connect-src *; script-src 'self' 'nonce-%s' https://www.google-analytics.com https://ssl.google-analytics.com https://www.googletagmanager.com; frame-src 'self'; report-uri /.well-known/csp-violation-report-endpoint/;"

WORKDIR /app
USER openresty

