#!/bin/bash

echo "TRAVIS_BRANCH: $TRAVIS_BRANCH"
echo "TRAVIS_PULL_REQUEST: $TRAVIS_PULL_REQUEST"
echo "TRAVIS_TAG: $TRAVIS_TAG"

if [[ "$TRAVIS_TAG" != "" ]]; then
    npm publish
    exit
fi
exit 0
