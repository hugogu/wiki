# -- DEV DOCKERFILE --
# -- DO NOT USE IN PRODUCTION! --

ARG BASE_IMAGE=node:24
FROM ${BASE_IMAGE}
LABEL maintainer "requarks.io"

RUN apt-get update && \
    apt-get install -y bash curl git python3 make g++ nano openssh-server gnupg && \
    mkdir -p /wiki

WORKDIR /wiki

COPY ./.yarnrc ./.yarnrc

ENV dockerdev 1
ENV DEVDB postgres

EXPOSE 3000

CMD ["tail", "-f", "/dev/null"]
