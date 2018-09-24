#!/bin/sh
# requires svgo: brew install svgo
for f in *.svg; do 
	echo $f":"; 
	svgo --enable={sortAttrs} --multipass --pretty $f -o - | sed 's/svg /svg width="25" height="25" /g' | sed 's/fill="#fff"/:fill="color || '"'"'currentColor'"'"'"/g' | sed 's/stroke="#fff"/:stroke="color || '"'"'currentColor'"'"'"/g' 
	echo; 
done