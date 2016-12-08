FROM mhart/alpine-node:6.9.1
MAINTAINER Mert <mertdogar@gmail.com>

WORKDIR /app
ADD . .

RUN apk update && \
    apk add --no-cache git && \
    npm install --unsafe-perm && \
    apk del git && \
    rm -rf /etc/ssl \
    /usr/share/man /tmp/* /var/cache/apk/* /root/.npm /root/.node-gyp \
    /usr/lib/node_modules/npm/man /usr/lib/node_modules/npm/doc /usr/lib/node_modules/npm/html

CMD ["npm", "start"]
