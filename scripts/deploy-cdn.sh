#!/bin/sh
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
scp -o PasswordAuthentication=no -P $port -r dist/* $user@$server:$target
