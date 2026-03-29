#!/bin/bash
while true; do
  cd /home/z/my-project/site
  node node_modules/.bin/next dev -p 3000
  echo "Service stopped, restarting in 2 seconds..." >> /home/z/my-project/daemon.log
  sleep 2
done
