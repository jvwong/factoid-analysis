import dbdriver from './util/db.js';
import { newlineEntries } from './util/file.js';

const loadTable = name => dbdriver.accessTable(name);

/**
 * deltaSub
 *
 * Load the Documents from the database and calculate the elapsed time between status initiated and submitted
 * @param {object} options
 * @param {string} input the name of the newline-delimited file of Document UUIDs
 * @return {object} data and fields (headers)
 */
export async function deltaSub ({ input }) {

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

  const doi = document => {
    return {
      doi: document('article')('PubmedData')('ArticleIdList')
            .filter(function(Id){
              return Id('IdType').eq('doi')
            })
            .nth(0)('id')
    }
  };

  const title = document => {
    return {
      title: r.branch(
        document('article')('MedlineCitation')('Article')('ArticleTitle').ne(null),
        document('article')('MedlineCitation')('Article')('ArticleTitle'),
        '')
    };
  };

  const elapsed = document => {
    return {
      elapsed:
        document('submitted').sub( document('created') ).div(60)
    }
  }

  const { conn, table, rethink: r } = await loadTable('document');
  let q = table;

  const uuids = await newlineEntries( input );
  q = q.getAll( ...uuids );

  // Merge in useful fields
  q = q.merge( doi );
  q = q.merge( title );
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

