#!/bin/sh
echo "Creating PR Preview"

cd dist/
../node_modules/.bin/surge-review
