#!/bin/sh
TAG=v$(node -p "require('./package.json').version")

echo "Starting deploying $minorVersion"
echo "--------------------------------"

echo "Creating Tag $TAG"
git tag -a $TAG -m $TAG
git push origin --tags

echo "Publishing to Github"
publish-release --token $GITHUB_TOKEN --owner $CIRCLE_PROJECT_USERNAME --repo $CIRCLE_PROJECT_REPONAME --tag $TAG --assets dist/share.html,dist/*.js

echo "Publishing to CDN"

minorVersion=$(node ./scripts/version.js)
user="podlove"
server="cdn.podlove.org"
port="10022"
target="/home/podlove/projects/podlove-web-player"

if [ -z "$1" ]
  then
    target=$target/$minorVersion
  else
    target=$target/$1
fi

echo "Creating $target@$server"
ssh -o PasswordAuthentication=no -p $port $user@$server "mkdir -p $target"

echo "Copy files to $target@$server"
scp -o PasswordAuthentication=no -P $port -r dist/share.html dist/*.js $user@$server:$target
