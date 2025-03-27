import { program } from 'commander';

import entitiesImpl from './entities.js';
import deltaSubImpl from './deltaSub.js';
import joinJournalImpl from './joinJournal.js';
import { sendOutput, json2csv } from './util/format.js';


async function joinJournal ( options ) {
  const { data, fields } = await joinJournalImpl( options );
  const csv = json2csv( data, { fields } );
  await sendOutput( csv, options );
}

async function deltaSub ( options ) {
  const { data, fields } = await deltaSubImpl( options );
  const csv = json2csv( data, { fields } );
  await sendOutput( csv, options );
}

async function entities ( options ) {
  const { data, fields } = await entitiesImpl( options );
  const csv = json2csv( data, { fields } );
  await sendOutput( csv, options );
}

async function main () {
  (program
    .name( 'factoid-analysis' )
    .description( 'A CLI for the analysis of the factoid database' )
  );

  (program.command( 'deltaSub' )
    .description( 'Elapsed time between status initiated and submitted' )
    .option('-i, --input <str>', 'Input txt file: Newline separated list of Document UUIDs')
    .option('-o, --output <str>', 'Output file: CSV results')
    .action( deltaSub )
  );

  (program.command( 'entities' )
    .description( 'Counts of interactions, participants and organisms' )
    .option('-i, --input <str>', 'Input txt file: Newline separated list of Document UUIDs')
    .option('-o, --output <str>', 'Output file: CSV results')
    .action( entities )
  );

  (program.command( 'joinJournal' )
    .description( 'Join PMID data with journal metadata' )
    .option('-i, --input <str>', 'Input csv file')
    .option('-o, --output <str>', 'Output file: CSV results')
    .action( joinJournal )
  );

  await program.parseAsync();
}

main();
