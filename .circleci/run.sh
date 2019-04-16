#!/usr/bin/env bash

set -x
set -e

mkdir -p /data/db && /usr/bin/mongod &

npm run install:all
npm run build:all
npm run test:all:ci
