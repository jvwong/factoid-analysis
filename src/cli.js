import { program } from 'commander';

import { deltaSub as deltaSubImpl } from './deltaSub.js';
import { sendOutput, json2csv } from './util/format.js';

async function deltaSub ( options ) {
  const { data, fields } = await deltaSubImpl( options );
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

  await program.parseAsync();
}

main();
