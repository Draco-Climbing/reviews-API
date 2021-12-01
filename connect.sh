#!/bin/bash
if [[ -z $1 ]] && [[ -z $2 ]]
then
  echo "usage: connect.sh <service> <IP address>"
else
  if [[ -z $2 ]]
  then
    echo "usage: connect.sh <service> <IP address>"
  else
    # copy over init file using scp
    scp -i ../../sdc-$1.pem ./init.sh ubuntu@$2:~/
    # start instance using pem
    ssh -i ../../sdc-$1.pem ubuntu@$2
  fi
fi
