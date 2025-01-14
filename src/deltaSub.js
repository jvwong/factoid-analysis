import dbdriver from './util/db.js';
import { newlineEntries } from './util/file.js';

const loadTable = name => dbdriver.accessTable(name);

/**
 * deltaSub
 *
 * Load the elife article metadata from the database and map to a contact list
 * @param {object} options
 * @return {object} the corresponding results
 */
export async function deltaSub ({ input }) {

  const uuids = await newlineEntries( input );

  const {
    // rethink: r,
    conn,
    table
  } = await loadTable('document');
  let q = table;

  q = q.getAll( ...uuids );
  q = q.count();

  const data = await q.run(conn);
  // const data = await cursor.toArray();
  conn.close(function (err) { if (err) throw err; });
  return data;
}
