#!/bin/bash

yarn start >/tmp/react-app.log 2>/tmp/react-app.err &
wget --retry-connrefused --waitretry=1 -t 15 http://localhost:3000

yarn test:wdio

cat /tmp/react-app.log
cat /tmp/react-app.err
