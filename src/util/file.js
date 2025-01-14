import {
  readFile,
  writeFile
} from 'node:fs/promises';
import path from 'path';
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
 * Writw data to file
 * @param {object} data the json data to convert
 *  @param {string} filename Name of the file
 * @returns
 */
export async function write(data, filename){
  const pathname = path.resolve ( path.join( DATA_FOLDER_ROOT, filename ) );
  return writeFile(pathname, data);
}
