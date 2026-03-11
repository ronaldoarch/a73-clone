#!/bin/bash
PG_DATA="/Users/ronaldodiasdesousa/postgresql-a73-data"
PG_LOG="/Users/ronaldodiasdesousa/postgresql-a73.log"
PG_CTL=$(which pg_ctl 2>/dev/null || find /opt/homebrew /usr/local -name pg_ctl 2>/dev/null | head -1)
if $PG_CTL -D "$PG_DATA" status 2>/dev/null | grep -q "running"; then
  echo "PostgreSQL já está rodando na porta 5433."
else
  $PG_CTL -D "$PG_DATA" -l "$PG_LOG" -o "-p 5433" start
  echo "PostgreSQL iniciado na porta 5433."
fi
