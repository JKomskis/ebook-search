const request = require('request');
const jsdom = require('jsdom');

const host = 'https://www.jkomskis.com/ebooks/api';

function getLibgenResults(res, query, page){
  request(
    'http://libgen.io/search.php?&req=' + query + 
    '&phrase=1&view=detailed&column=def&sort=def&sortmode=ASC&page=' + page,
    (error, response, body) => {
      console.log('Got search results from Library Genesis, parsing...')
      const dom = new jsdom.JSDOM(body);
      let results = parseSearchResponse(res, dom);
      console.log('Parsed, returning...')
      res.json(results);
    }
  );
}

function parseSearchResponse(res, dom) {
  let tables = dom.window.document.querySelectorAll('table');
  let entries = [];
  let data = [];
  /*for(let i = 0; i < tables.length; ++i){
    console.log('============' + i + '==========');
    console.log(tables[i].innerHTML);
  }
  return;*/
  for(let i = 3; i < tables.length-1; i+=2){
    entries.push(tables[i]);
  }
  for(let entry of entries) {
    //console.log(entry.innerHTML);
    let parsedEntry = parseSearchEntry(res, entry);
    if(parsedEntry.language === 'English'
        && parsedEntry.title != ''){
      data.push(parsedEntry);
    }
  }

  return data;
}

function parseSearchEntry(res, entry) {
  let rows = entry.querySelectorAll('tr');

  let parsed = {
    title: parseEntryTitle(rows[1]),
    cover: 'http://libgen.io' + parseEntryCover(rows[1]),
    author: parseEntryAuthor(rows[2]),
    publisher: parseEntryPublisher(rows[4]),
    year: parseEntryYear(rows[5]),
    language: parseEntryLanguage(rows[6]),
    pages: parseEntryPages(rows[6]),
    isbn: parseEntryIsbns(rows[7]),
    size: parseEntrySize(rows[9]),
    extension: parseEntryExtension(rows[9]),
  }
  
  let md5 = parseEntryMd5(rows[1]);
  parsed['downloadLink'] = host + '/libgen/download?md5=' + md5;

  return parsed;
}

function parseEntryTitle(row) {
  return row.querySelectorAll('td')[2].querySelector('b').querySelector('a').innerHTML.trim();
}

function parseEntryCover(row) {
  return row.querySelectorAll('td')[0].querySelector('a').querySelector('img').src.trim();
}

function parseEntryAuthor(row) {
  let authors = [];
  for(let author of row.querySelectorAll('td')[1].querySelector('b').querySelectorAll('a')){
    authors.push(author.innerHTML.trim());
  }
  return authors;
}

function parseEntryPublisher(row) {
  return row.querySelectorAll('td')[1].innerHTML.trim();
}

function parseEntryYear(row) {
  return row.querySelectorAll('td')[1].innerHTML.trim();
}

function parseEntryPages(row) {
  return row.querySelectorAll('td')[3].innerHTML.trim();
}

function parseEntryLanguage(row) {
  return row.querySelectorAll('td')[1].innerHTML.trim();
}

function parseEntryIsbns(row) {
  let isbns = row.querySelectorAll('td')[1].innerHTML.split(', ');
  return isbns;
}

function parseEntrySize(row) {
  return row.querySelectorAll('td')[1].innerHTML.trim();
}

function parseEntryExtension(row) {
  return row.querySelectorAll('td')[3].innerHTML.trim();
}

function parseEntryMd5(row) {
  let link = row.querySelectorAll('td')[0].querySelector('a').href;
  return link.substring(link.indexOf('=')+1).trim();
}

function downloadRedirect(res, md5) {
  request(
    'http://www.libgen.io/ads.php?md5=' + md5,
    (error, response, body) => {
      console.log('Fetched download page, parsing the download link...');
      const adsDom = new jsdom.JSDOM(body);
      let downloadLink = adsDom.window.document.
                          querySelectorAll('td')[2].querySelectorAll('a')[0].href;
      console.log('Parsed, redirecting to the download...');
      res.redirect(downloadLink);
    }
  );
}

module.exports = {
  getLibgenResults: getLibgenResults,
  downloadRedirect: downloadRedirect
};
