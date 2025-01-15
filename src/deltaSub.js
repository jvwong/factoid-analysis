import r from 'rethinkdb';
import dbdriver from './util/db.js';
import { newlineEntries } from './util/file.js';
import * as field from './util/rethinkdb.js';

const loadTable = name => dbdriver.accessTable(name);

/**
 * Calculate elapsed time between Document status 'initiated' and 'submitted'
 *
 * @param {object} options The commander options object
 * @param {string} options.input The input file of newline-delimited Document UUIDs
 * @return {object} JSON data and fields (i.e. JSON object keys)
 */
export default async function deltaSub ({ input }) {

  const created = document => {
    return {
      created: r.branch(
        document('createdDate').typeOf().eq('PTYPE<TIME>'),
          r.round(document('createdDate').toEpochTime()),
        document('createdDate').typeOf().eq('NUMBER'),
          r.round(document('createdDate')),
        null
      ),
      dateCreated: r.branch(
        document('createdDate').typeOf().eq('PTYPE<TIME>'),
          document('createdDate').toISO8601().split('T')(0),
        document('createdDate').typeOf().eq('NUMBER'),
          r.epochTime(document('createdDate')).toISO8601().split('T')(0),
        null
      )
    }
  };

  const submitted =  document => {
    return {
      submitted:
        r.branch(
          document('_ops')
            .filter( function(op){
              return op('data')('status').eq('submitted');
            })
            .count().gt(0),
          document('_ops')
            .filter( function(op){
              return op('data')('status').eq('submitted');
            })
            .nth(0).default(0)('timestamp')
            .toEpochTime()
            .round(),
          null
        )
    }
  };

  const hasSubmitted = document => {
    return document('submitted').ne(null);
  }

  const elapsed = document => {
    return {
      elapsed:
        document('submitted').sub( document('created') ).div(60)
    }
  }

  const { conn, table } = await loadTable('document');
  let q = table;

  const uuids = await newlineEntries( input );
  q = q.getAll( ...uuids );

  // Merge in useful fields
  q = q.merge( field.doi );
  q = q.merge( field.title );
  q = q.merge( created );
  q = q.merge( submitted );
  q = q.filter( hasSubmitted );
  q = q.merge( elapsed );

  // Retrieve fields
  const fields = [ 'id', 'doi', 'title', 'dateCreated', 'elapsed' ];
  q = q.pluck( fields );

  // Execute query
  const cursor = await q.run(conn);
  const data = await cursor.toArray();
  conn.close(function (err) { if (err) throw err; });

  return ({ data, fields });
}

