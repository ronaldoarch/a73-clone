#!/bin/bash
PG_DATA="/Users/ronaldodiasdesousa/postgresql-a73-data"
PG_CTL=$(which pg_ctl 2>/dev/null || find /opt/homebrew /usr/local -name pg_ctl 2>/dev/null | head -1)
if $PG_CTL -D "$PG_DATA" status 2>/dev/null | grep -q "running"; then
  $PG_CTL -D "$PG_DATA" stop
  echo "PostgreSQL parado."
else
  echo "PostgreSQL não está rodando."
fi
