import _ from 'lodash';
import {
  readFile,
  writeFile
} from 'node:fs/promises';
import path from 'path';

import { parse } from 'csv-parse/sync';

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
export async function getCsv2json( filename, options = {} ) {
  const pathname = path.resolve ( path.join( DATA_FOLDER_ROOT, filename ) );
  const DEFAULT_OPTS = { columns: true };
  const opts = _.defaults( options, DEFAULT_OPTS );
  const csv = await readFile( pathname, { encoding: 'utf8' } );
  const json = parse( csv, opts );

  return json;
}

/**
 * Retrieve json from file
 *
 * @param {string} filename Name of the file
 * @returns {object} Array of JSON entries
 */
export async function getJson( filename ) {
  const pathname = path.resolve ( path.join( DATA_FOLDER_ROOT, filename ) );
  const data = await readFile( pathname, 'utf8' );
  const json = JSON.parse( data );
  return json;
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
