import _ from 'lodash';
import { getJson, getCsv2json } from './util/file.js';
import chunkify from 'chunkify';
import { fetchPubmed } from './util/pubmed.js';

// Load journal metadata
const journalMap = new Map();
const journals = await getJson( 'journal-list.json' );
for ( const journal of journals ) {
  const { issn } = journal;
  issn.forEach( ({ value }) => {
    journalMap.set( value, journal );
  });
}

// Walk through PubMed data
const augmentData = ( data, pmArticleSet ) => {
  const getISSN = PubmedArticle => {
    const { MedlineCitation: { Article } } = PubmedArticle;
    const { Journal: { ISSN } } = Article;
    return ISSN;
  };
  const output = [];
  for ( const datum of data ) {
    let augmented = _.assign( {}, datum );
    const { pmid } = datum;
    const pmArticle = _.find( pmArticleSet, function(o) { return o.MedlineCitation.PMID === pmid; } );
    const ISSN = getISSN( pmArticle );
    const jrnlMeta = journalMap.get( ISSN.value );

    // if( journal ) {
    const { title: journal, h_index, publisher } = jrnlMeta;
    _.assign( augmented, { journal, h_index, publisher });
    // }
    output.push( augmented );
  }
  return output;
};

/**
 * joinJournal - Join PMID data with journal metadata
 *
 * @param {object} options The commander options object
 * @param {string} options.input The input csv filename
 * @return {object} JSON data and fields (i.e. JSON object keys)
 */
export default async function joinJournal ({ input }) {
  const getPmid = x => x.pmid;


  const data = [];
  const chunkSize = 1000;

  // Load biofactoid email campaign data
  const emailData = await getCsv2json( input );
  const emailDataChunks = chunkify( emailData, chunkSize );

  let i = 0;
  for await ( const chunk of emailDataChunks ) {
    // Retrieve PMIDs
    console.log( `Fetching chunk ${++i}` );
    const uids = chunk.map( getPmid );
    const { PubmedArticleSet } = await fetchPubmed({ uids });
    const augmented = augmentData( chunk, PubmedArticleSet );
    data.push( ...augmented );
  };

  return ({
    data,
    fields: [
      'pmid',
      'emailRecipientAddress',
      'inviteSent',
      'campaign',
      'type',
      'isDocument',
      'h_index',
      'journal',
      'publisher'
    ]
  });
}

