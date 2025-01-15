import { Parser } from 'json2csv';
import { write } from './file.js';

const formatJSON = obj => JSON.stringify(obj, null, 2);
const printFormattedJSON = obj => console.log(formatJSON(obj));

/**
 * Map JSON data to CSV
 *
 * @param {array} jsonData Array of JSON objects
 * @param {object} opts  Parser options {@link https://juanjodiaz.github.io/json2csv/#/parsers/parser}
 * @returns
 */
export function json2csv( jsonData, opts ) {
  try {
    const parser = new Parser( opts );
    const csv = parser.parse( jsonData );
    return csv;
  } catch (err) {
    console.error(err);
  }
}

/**
 * Configure the output mode (console or file)
 *
 * @param {object} data Data to display
 * @param {object} options The commander options (default: console)
 * @param {string} options.output The file name to write to (default directory `DATA_FOLDER_ROOT`)
 */
export async function sendOutput (data, options) {
  if (options.output) {
    await write(data, options.output);
  } else {
    printFormattedJSON(data);
  }
}
