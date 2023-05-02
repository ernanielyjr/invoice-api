#!/bin/bash

if [[ " $@ " =~ " --help " ]]; then
  echo
  echo "Usage: $0 [options]"
  echo
  echo "Options:"
  echo "  --skip-export       Will not export database from remote server, will assume that files already exported."
  echo "  --skip-import       Will not import to local database"
  echo "  --no-drop           Will prevent collections from being dropped. The import process will attempt to merge with the current data."
  echo "  --help              Show this."
  echo

  exit
fi

if [[ " $@ " =~ " --skip-export " ]]; then
   SKIP_EXPORT=true
fi

if [[ " $@ " =~ " --skip-import " ]]; then
   SKIP_IMPORT=true
fi

if [[ " $@ " =~ " --no-drop " ]]; then
   NO_DROP=true
fi

if [ $SKIP_EXPORT ] && [ $SKIP_IMPORT ]; then
  echo
  echo "Nothing to do! Bye!"
  echo
  exit
fi

echo "============"
echo

echo "Loading .env file"
export $(grep -v '^#' .env | xargs)
echo "Done!"
echo

mkdir -p exported

COLLECTIONS=(
  "customers"
  "invoices"
  "services"
  "users"
  "emails"
)

echo "============"
echo

for i in ${!COLLECTIONS[@]}; do
  COLLECTION=${COLLECTIONS[$i]}

  echo "Exporting: $COLLECTION"
  if [ $SKIP_EXPORT ]; then
    echo "Skiped!"
  else
    mongoexport --jsonArray --uri "mongodb+srv://USERNAME:PASSWORD@HOST/DATABASE" -o ./exported/$COLLECTION.json -c $COLLECTION
    echo "Done!"
  fi

  echo
  # mascarar emails

  echo "Importing: $COLLECTION"
  if [ $SKIP_IMPORT ]; then
    echo "Skiped!"
  else
    DROP_ARG="--drop"
    if [ $NO_DROP ]; then
      DROP_ARG=""
    fi
    mongoimport $DROP_ARG --jsonArray --uri "$dbUrl" -c $COLLECTION ./exported/$COLLECTION.json
    echo "Done!"
  fi

  echo
  echo "============"
  echo
done
