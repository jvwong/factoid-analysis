# factoid-analysis
A CLI for the analysis of the factoid database

## Data source

- eLife articles submitted to biofactoid in 2024
- ./archives/factoid_dump_2025-01-15_analysis.tar.gz (311.9 MB)

## Required software

- [Node.js](https://nodejs.org/en/) v22.11.0
- [RethinkDB](http://rethinkdb.com/) ^2.3.0

## Configuration

The following environment variables can be used to configure the scripts:

Database:

- `DB_NAME` : name of the db (default `factoid`)
- `DB_HOST` : hostname or ip address of the database host (default `localhost`)
- `DB_PORT` : port where the db can be accessed (default `28015`, the rethinkdb default)
- `DB_USER` : username if the db uses auth (undefined by default)
- `DB_PASS` : password if the db uses auth (undefined by default)

Downloads:

- `BULK_DOWNLOADS_PATH` : relative path to bulk downloads

## Run targets

- `npm start` : start
