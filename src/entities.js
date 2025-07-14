import dbdriver from './util/db.js';
import { newlineEntries } from './util/file.js';
import * as field from './util/rethinkdb.js';

const loadTable = name => dbdriver.accessTable(name);

/**
 * Calculate the number of entities in submitted Documents
 *
 * @param {object} options The commander options object
 * @param {string} options.input The input file of newline-delimited Document UUIDs
 * @return {object} JSON data and fields (i.e. JSON object keys)
 */
export default async function entities ({ input }) {

  const { conn, table } = await loadTable('document');
  let q = table;

  const uuids = await newlineEntries( input );
  q = q.getAll( ...uuids );

  // Merge in useful fields
  q = q.merge( field.doi );
  q = q.merge( field.title );

  // Calculate number of interactions
  q = q.map( field.mergeEntries );
  q = q.merge( field.numInteractions );

  // Retrieve fields
  const fields = [
    'id',
    'doi',
    'title',
    'numInteractions',
    'participants'
  ];
  q = q.pluck( fields );

  // Execute query
  const cursor = await q.run(conn);
  const data = await cursor.toArray();
  conn.close(function (err) { if (err) throw err; });

  return ({ data, fields });
}

