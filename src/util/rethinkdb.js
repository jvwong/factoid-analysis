import r from 'rethinkdb';

export const title = document => {
  return {
    title: r.branch(
      document('article')('MedlineCitation')('Article')('ArticleTitle').ne(null),
      document('article')('MedlineCitation')('Article')('ArticleTitle'),
      '')
  };
};

export const doi = document => {
  return {
    doi: document('article')('PubmedData')('ArticleIdList')
          .filter(function(Id){
            return Id('IdType').eq('doi')
          })
          .nth(0)('id')
  }
};

export const mergeEntries = document => {
  return document.merge({ entries: document( 'entries' )( 'id' ) });
}

export const numInteractions = document => {
  return {
    numInteractions:
      r.db('factoid').table('element')
        .getAll( r.args( document( 'entries' ) ) )
        .coerceTo( 'array' )
        .pluck( 'id', 'association', 'type', 'name', 'entries' )
        .filter(function (element) {
          return  element('type').eq('ggp').not()
            .and( element('type').eq('dna').not() )
            .and( element('type').eq('rna').not() )
            .and( element('type').eq('protein').not() )
            .and( element('type').eq('chemical').not() )
            .and( element('type').eq('complex').not()  )
            .and( element('type').eq('namedComplex').not()  )
        })

        .merge( function( interaction ){
          return {
            participants: interaction('entries')
              .map( function( entry ){
                return r.db('factoid').table('element')
                  .get( entry('id') )
                  .pluck( 'id', 'type', 'name', 'association', 'parentId' )
                  .merge( { group: entry('group') } )
                  .merge( function( entry ) {
                    return r.branch( entry('type').eq('complex'),
                      {
                        components: r.db('factoid').table('element')
                          .get( entry('id') )('entries')
                          .map( function( component ){
                            return r.db('factoid').table('element')
                              .get( component('id') )
                              .pluck( 'id', 'type', 'name', 'association', 'parentId' )
                          })
                          .merge( function( component ){
                              return {
                                xref: r.branch(
                                  entry.hasFields('association'),
                                  entry('association')('dbPrefix').add( ':', entry('association')('id') ),
                                  ''
                                )
                              }
                          })
                          .without( 'association' )
                      },
                      {}
                    )
                  })
              })
              .merge( function( entry ){
                return {
                  xref: r.branch(
                    entry.hasFields('association'), entry('association')('dbPrefix').add( ':', entry('association')('id') ) ,
                    ''
                  )
                }
              })
            .map( function( entry ){
              return entry
                .pluck( 'id', 'name', 'xref', 'group', 'type', 'parentId', 'components' )
            })
          };
        })

        .without('association', 'name', 'entries' )
        .count()
  }
}