FROM python:3.10-alpine
LABEL Maintainer="Rajesh Rajendran<rjshrjndrn@gmail.com>"
LABEL Maintainer="KRAIEM Taha Yassine<tahayk2@gmail.com>"
RUN apk upgrade busybox --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main
RUN apk add --no-cache build-base libressl libffi-dev libressl-dev libxslt-dev libxml2-dev xmlsec-dev xmlsec nodejs npm tini
ARG envarg
ENV SOURCE_MAP_VERSION=0.7.4 \
    APP_NAME=chalice \
    LISTEN_PORT=8000 \
    ENTERPRISE_BUILD=${envarg}

ADD https://unpkg.com/source-map@${SOURCE_MAP_VERSION}/lib/mappings.wasm /mappings.wasm

WORKDIR /work_tmp
COPY requirements.txt /work_tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /work_tmp/requirements.txt
COPY sourcemap-reader/*.json /work_tmp/
RUN cd /work_tmp && npm install

WORKDIR /work
COPY . .
RUN mv env.default .env && mv /work_tmp/node_modules sourcemap-reader/. && chmod 644 /mappings.wasm

RUN adduser -u 1001 openreplay -D
USER 1001

ENTRYPOINT ["/sbin/tini", "--"]
CMD ./entrypoint.sh
