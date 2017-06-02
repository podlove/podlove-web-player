#!/bin/sh

ASSETS_DIRECTORY=dist/*.*

FILES=$(ls -m $ASSETS_DIRECTORY | sed -e "s/, /,/g")

# echo "Publishing to Github Releases"
publish-release --token $GITHUB_TOKEN --owner $CIRCLE_PROJECT_USERNAME --repo $CIRCLE_PROJECT_REPONAME --tag $CIRCLE_TAG --assets $FILES --name "Podlove Web Player"  --notes " "
