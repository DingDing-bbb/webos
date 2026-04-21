#!/bin/bash
cd /home/z/my-project/site
while true; do
  echo "$(date): 启动服务..." >> /home/z/my-project/daemon.log
  node node_modules/next/dist/bin/next dev -p 3000 2>&1 | tee -a /home/z/my-project/daemon.log
  echo "$(date): 服务退出，重新启动..." >> /home/z/my-project/daemon.log
  sleep 3
done
