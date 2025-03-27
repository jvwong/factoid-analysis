import { getJsonIterator } from './util/file.js';

/**
 * joinJournal - Join PMID data with journal metadata
 *
 * @param {object} options The commander options object
 * @param {string} options.input The input csv filename
 * @return {object} JSON data and fields (i.e. JSON object keys)
 */
export default async function joinJournal ({ input }) {

  const data = [];
  // Load biofactoid email campaign data
  const jsonIterator = await getJsonIterator( input );
  for await ( const record of jsonIterator ) {
    // Work with each record
    data.push( record );
  }

  return ({
    data,
    fields: [
      'pmid',
      'emailRecipientAddress',
      'inviteSent',
      'campaign',
      'type',
      'isDocument'
    ]
  });
}

