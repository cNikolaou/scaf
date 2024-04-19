#!/bin/bash

# Install specific version of Sui and sui-test-validator to
# ensure compatibility

VERSION=1.22.0

if [ ! -z $1 ]; then
    VERSION=$1
fi;

echo "> Installing sui and sui-test-validator version: $VERSION"

cargo install --locked --git https://github.com/MystenLabs/sui.git \
    --branch releases/sui-v${VERSION}-release sui sui-test-validator
