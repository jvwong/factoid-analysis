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

  const extractPmFields = PubmedArticle => {
    const getPubmedDate =  History => {
      const formatDate = ({ Year, Month, Day }) => `${Year}-${Month}-${Day}`;
      const pmDate = _.find( History, { PubStatus: 'pubmed' } );
      if( !pmDate ) throw new Error( `No PubMed date found for article` );
      const { PubMedPubDate } = pmDate;
      return formatDate( PubMedPubDate );
    };
    const { MedlineCitation: { Article }, PubmedData } = PubmedArticle;
    const { AuthorList, Journal: { ISSN, Title: JournalTitle } } = Article;

    const { History } =  PubmedData;
    const PubMedPubDate = getPubmedDate( History );
    return ({ ISSN, PubMedPubDate, AuthorList, JournalTitle });
  };

  const output = [];
  for ( const datum of data ) {
    let augmented = _.assign( {}, datum );
    const { pmid } = datum;
    const pmArticle = _.find( pmArticleSet, function(o) { return o.MedlineCitation.PMID === pmid; } );
    if( !pmArticle ) {
      console.error( `No PubMed article found for PMID ${pmid}` );
      throw new Error();
    }

    const { ISSN, PubMedPubDate, AuthorList, JournalTitle } = extractPmFields( pmArticle );

    let h_index = null;
    let sjr = null;
    let journal = JournalTitle;
    let date = PubMedPubDate;
    let numAuthors = AuthorList ? AuthorList.length : null;

    if( journalMap.has( ISSN.value ) ) {
      const jrnlMeta = journalMap.get( ISSN.value );
      h_index = jrnlMeta.h_index;
      sjr = jrnlMeta.sjr;
    }
    _.assign( augmented, { journal, h_index, sjr, date, numAuthors });
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

  // Load biofactoid email campaign data
  const emailData = await getCsv2json( input );
  const CHUNK_SIZE = 1000;
  const emailDataChunks = chunkify( emailData, CHUNK_SIZE );

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
    fields: Object.keys( data[0] )
  });
}

