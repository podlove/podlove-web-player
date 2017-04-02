#!/bin/sh
version=$(node ./scripts/version.js)
user="podlove"
server="cdn.podlove.org"
port="10022"
target="/home/podlove/projects/podlove-web-player"

echo $version

if [ -z "$1" ]
  then
    target=$target/$version
  else
    target=$target/$1
fi

echo "Creating $target@$server"
ssh -p $port $user@$server "mkdir -p $target"

echo "Copy files to $target@$server"
scp -P $port -r dist/share.html dist/*.js $user@$server:$target