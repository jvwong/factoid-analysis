import { program } from 'commander';

import { sendOutput } from './util/format.js';

async function todo (options) {
  await sendOutput({ result: 'hello world!' }, options);
}

async function main () {
  (program
    .name('factoid-analysis')
    .description('A CLI for the analysis of the factoid database')
  );

  (program.command('todo')
    .description('analysis of factoid database - todo')
    .action(todo)
  );

  await program.parseAsync();
}

main();
