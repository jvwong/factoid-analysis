# factoid-analysis

A command line interface for analyzing author submissions to [Biofactoid](https://biofactoid.org/).

There are commands available to (1) Calculate elapsed time between the initiation (creation) and submission of a Biofactoid entry and (2) Count the number of interactions associated with each Biofactoid submission.

## Required software

- [Node.js](https://nodejs.org/en/) v22.11.0
- [RethinkDB](http://rethinkdb.com/) ^2.3.0
  - We maintain a [RethinkDB Docker image](https://hub.docker.com/r/pathwaycommons/rethinkdb-docker) that has the appropriate RethinkDB [Python driver](https://rethinkdb.com/docs/install-drivers/python/) pre-installed, needed for restoring the database from a dump file.

## Getting started

1. Get the RethinkDB database file

Download the Biofactoid database dump which was exported on July 12, 2025. This file is not being made publically available as it contains email addreses of authors who were invited to use Biofactoid.

2. Restore RethinkDB database from file

Assuming:

- a. you are in the directory where the dump file is located
- b. a RethinkDB instance is running with a default configuration (i.e. `localhost:28015`)
- c. the Rethinkdb Python driver is installed

Run the following command to [restore the RethinkDB  database](https://rethinkdb.com/docs/backup/):

```bash
rethinkdb restore --import factoid ./factoid_dump_2025-07-12_01-12-31-179_analysis.tar.gz
```

3. Run a command

e.g. For `deltaSub`, run the following command:

```bash
node ./factoid-analysis deltaSub --input public_JUL-14-2025.txt --output public_JUL-14-2025_deltaSub.csv
```

## Configuration

The following environment variables can be used to configure the scripts:

General:
- `DATA_FOLDER_ROOT` : root directory for data files (default `./data`)

Database:

- `DB_NAME` : name of the db (default `factoid`)
- `DB_HOST` : hostname or ip address of the database host (default `localhost`)
- `DB_PORT` : port where the db can be accessed (default `28015`, the rethinkdb default)
- `DB_USER` : username if the db uses auth (undefined by default)
- `DB_PASS` : password if the db uses auth (undefined by default)

Downloads:

- `BULK_DOWNLOADS_PATH` : relative path to bulk downloads

## Commands

For the following, input and output files are assumed to be placed in the directory specified by `DATA_FOLDER_ROOT`

- `deltaSub` : Calculate elapsed time between the initiation (creation) and submission of a Biofactoid entry
  - arguments:
    - `input`: Input file containing Biofactoid newline deliminte Biofacoid entry UUIDs (e.g., `public_JUL-14-2025.txt`)
    - `output`: Output file for the results in CSV format (e.g., `public_JUL-14-2025_deltaSub.csv`)
- `entities`: Count the number of interactions associated with each Biofactoid submission
  - arguments are same as above

See `node ./factoid-analysis --help` for more information.
