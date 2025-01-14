import { program } from 'commander';

import { deltaSub as deltaSubImpl } from './deltaSub.js';
import { sendOutput } from './util/format.js';

async function deltaSub ( options ) {
  const data = await deltaSubImpl( options );
  await sendOutput( data, options );
}

async function main () {
  (program
    .name( 'factoid-analysis' )
    .description( 'A CLI for the analysis of the factoid database' )
  );

  (program.command( 'deltaSub' )
    .description( 'Elapsed time between status initiated and submitted' )
    .option('-i, --input <str>', 'Input txt file: Newline separated list of Document UUIDs')
    .action( deltaSub )
  );

  await program.parseAsync();
}

main();
