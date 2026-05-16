# =========================
# --- BUILD NPM MODULES ---
# =========================
ARG BASE_IMAGE=node:24-alpine
FROM ${BASE_IMAGE} AS build
ARG NODE_ENV=production
ARG YARN_REGISTRY=https://registry.npmjs.org

RUN sed -i 's|dl-cdn.alpinelinux.org|mirrors.ustc.edu.cn|g' /etc/apk/repositories && \
    apk add yarn g++ make cmake python3 py3-setuptools --no-cache

WORKDIR /wiki

ENV npm_config_build_from_source=true \
    npm_config_disturl=https://npmmirror.com/mirrors/node \
    NODE_ENV=${NODE_ENV}

RUN yarn config set registry "${YARN_REGISTRY}"

COPY ./package.json ./yarn.lock ./.yarnrc ./
COPY ./patches ./patches

RUN yarn --production --frozen-lockfile --non-interactive --network-timeout 100000
RUN yarn patch-package

# ===============
# --- Release ---
# ===============
FROM ${BASE_IMAGE}
LABEL maintainer="requarks.io"
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN sed -i 's|dl-cdn.alpinelinux.org|mirrors.ustc.edu.cn|g' /etc/apk/repositories && \
    apk add bash curl git openssh gnupg sqlite --no-cache && \
    mkdir -p /wiki && \
    mkdir -p /logs && \
    mkdir -p /wiki/data/content && \
    chown -R node:node /wiki /logs

WORKDIR /wiki

COPY --chown=node:node ./build/assets ./assets
COPY --chown=node:node --from=build /wiki/node_modules ./node_modules
COPY --chown=node:node ./server ./server
COPY --chown=node:node ./dev/build/config.yml ./config.yml
COPY --chown=node:node ./build/package.json ./package.json
COPY --chown=node:node ./LICENSE ./LICENSE

USER node

VOLUME ["/wiki/data/content"]

EXPOSE 3000
EXPOSE 3443

CMD ["node", "server"]
