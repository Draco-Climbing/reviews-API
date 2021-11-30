FROM mongo:latest

RUN mkdir /seed/
COPY *.csv /seed/

COPY import.sh /docker-entrypoint-initdb.d