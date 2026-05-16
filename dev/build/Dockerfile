# ====================
# --- Build Assets ---
# ====================
ARG BASE_IMAGE=node:24-alpine
FROM ${BASE_IMAGE} AS assets
ARG YARN_REGISTRY=https://registry.npmjs.org

# Use China mirror for Alpine packages
RUN sed -i 's|dl-cdn.alpinelinux.org|mirrors.ustc.edu.cn|g' /etc/apk/repositories && \
    apk add yarn g++ make cmake python3 py3-setuptools --no-cache

WORKDIR /wiki

ENV npm_config_build_from_source=true \
    npm_config_disturl=https://npmmirror.com/mirrors/node \
    CYPRESS_INSTALL_BINARY=0

RUN yarn config set registry "${YARN_REGISTRY}"

# Copy dependency files first (rarely change) -> cached layer
COPY ./package.json ./yarn.lock ./.yarnrc ./
COPY ./patches ./patches

ARG CACHE_CLEAN=false
RUN if [ "$CACHE_CLEAN" = "true" ]; then yarn cache clean; fi
RUN yarn --frozen-lockfile --non-interactive --network-timeout 100000

# Copy source files (frequently change) -> separate layer
COPY ./client ./client
COPY ./dev ./dev
COPY ./vite.config.mjs ./vite.config.mjs

RUN yarn build
RUN rm -rf /wiki/node_modules
RUN yarn --production --frozen-lockfile --non-interactive --network-timeout 100000 --ignore-optional && \
    yarn patch-package && \
    # Clean up unnecessary files to reduce image size
    find /wiki/node_modules -type f \( \
        -name "*.md" -o \
        -name "*.map" -o \
        -name "*.ts" -o \
        -name "*.tsx" -o \
        -name ".editorconfig" -o \
        -name ".eslintrc*" -o \
        -name ".prettierrc*" -o \
        -name ".babelrc*" -o \
        -name "tsconfig.json" -o \
        -name "jest.config.js" -o \
        -name "webpack.config.js" -o \
        -name "vite.config.*" \
    \) -delete && \
    find /wiki/node_modules -type d \( \
        -name "test" -o \
        -name "tests" -o \
        -name "__tests__" -o \
        -name "docs" -o \
        -name "doc" -o \
        -name "examples" -o \
        -name "demo" -o \
        -name "samples" -o \
        -name ".github" -o \
        -name ".git" -o \
        -name "man" -o \
        -name "benchmark" \
    \) -exec rm -rf {} + 2>/dev/null || true

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

COPY --chown=node:node --from=assets /wiki/assets ./assets
COPY --chown=node:node --from=assets /wiki/node_modules ./node_modules
COPY --chown=node:node ./server ./server
COPY --chown=node:node ./dev/build/config.yml ./config.yml
COPY --chown=node:node ./package.json ./package.json
COPY --chown=node:node ./LICENSE ./LICENSE

USER node

VOLUME ["/wiki/data/content"]

EXPOSE 3000
EXPOSE 3443

# HEALTHCHECK --interval=30s --timeout=30s --start-period=30s --retries=3 CMD curl -f http://localhost:3000/healthz

CMD ["node", "--no-deprecation", "server"]
