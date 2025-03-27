import {
  readFile,
  writeFile
} from 'node:fs/promises';
import fs from 'node:fs';
import path from 'path';
import { parse } from 'csv-parse';
import _ from 'lodash';

import { DATA_FOLDER_ROOT } from '../config.js';

/**
 * Extract entries from a newline-delimited text file
 *
 * @param {string} filename Name of the file
 * @returns {object} Array of entries
 */
export async function newlineEntries( filename ) {
  let data;
  const pathname = path.resolve ( path.join( DATA_FOLDER_ROOT, filename ) );
  const text = await readFile( pathname, { encoding: 'utf8' } );
  data = text.split('\n').filter( x => x.length > 0 );
  return data;
}

/**
 * Retrieve a JSON iterator from a csv file
 *
 * @param {string} filename Name of the file
 * @param {object} options CSV parser options
 * @returns {object} Array of JSON entries
 */
export async function getJsonIterator( filename, options = {} ) {
  const pathname = path.resolve ( path.join( DATA_FOLDER_ROOT, filename ) );
  const DEFAULT_OPTS = { columns: true };
  const opts = _.defaults( options, DEFAULT_OPTS );
  const parser = fs
    .createReadStream( pathname )
    .pipe(parse( opts ));

  return parser;
}

/**
 * Writw data to file
 * @param {object} data the json data to convert
 *  @param {string} filename Name of the file
 * @returns
 */
export async function write(data, filename){
  const pathname = path.resolve ( path.join( DATA_FOLDER_ROOT, filename ) );
  return writeFile(pathname, data);
}
