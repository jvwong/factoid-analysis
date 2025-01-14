import { Parser } from 'json2csv';
import { write } from './file.js';

const formatJSON = obj => JSON.stringify(obj, null, 2);
const printFormattedJSON = obj => console.log(formatJSON(obj));

export function json2csv (jsonData) {
  try {
    const parser = new Parser();
    const csv = parser.parse(jsonData);
    return csv;
  } catch (err) {
    console.error(err);
  }
}

export async function sendOutput (data, options) {
  if (options.output) {
    await write(data, options.output);
  } else {
    printFormattedJSON(data);
  }
}
