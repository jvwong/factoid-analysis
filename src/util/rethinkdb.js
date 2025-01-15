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