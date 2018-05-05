var libgenPage = 1;
var ircPage = 0;
var query;

function search() {
  libgenPage = 1;
  ircPage = 0;
  document.getElementById('libgenResults').innerHTML = '';
  document.getElementById('libgenLoadMoreButton').classList.add('hidden');
  document.getElementById('ircResults').innerHTML = '';
  document.getElementById('ircLoadMoreButton').classList.add('hidden');
  document.getElementById('searchButton').innerText = 'Searching...';
  document.getElementById('searchButton').classList.add('disabled');
  var searchInput = (<HTMLInputElement>document.getElementById('searchInput')).value;
  query = searchInput;
  let url = 'https://www.jkomskis.com/ebooks/api/libgen/search?query='
            + encodeURI(searchInput).replace(/%20/g,'+')
            + '&page=' + libgenPage;
  getLibgenResults(url);
  url = 'https://www.jkomskis.com/ebooks/api/irc/search?query='
            + encodeURI(searchInput)
            + '&page=' + ircPage
  getIrcResults(url);
}

function libgenLoadMore() {
  document.getElementById('libgenLoadMoreButton').innerText = 'Loading...';
  document.getElementById('libgenLoadMoreButton').classList.add('disabled');
  ++libgenPage;
  let url = 'https://www.jkomskis.com/ebooks/api/libgen/search?query='
            + encodeURI(query).replace(/%20/g,'+')
            + '&page=' + libgenPage;
  getLibgenResults(url);
}

function getLibgenResults(url){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function () {
    var status = xhr.status;
    //if everything completed successfully
    if (status === 200) {
      displayLibgenResults(xhr.response);
      document.getElementById('libgenLoadMoreButton').classList.remove('hidden');
      document.getElementById('libgenLoadMoreButton').classList.remove('disabled');
      document.getElementById('libgenLoadMoreButton').innerText = 'Load More';
      document.getElementById('searchButton').innerText = 'Search';
      document.getElementById('searchButton').classList.remove('disabled');
    }
    else {
    }
  };
  xhr.send();
}

function displayLibgenResults(response) {
  for(let book of response) {
    document.getElementById('libgenResults').appendChild(createCard(book));
  }
}

function createCard(book) {
  let container = document.createElement('div');
  container.classList.add('column');
  container.classList.add('col-3');
  container.classList.add('col-md-6');
  container.classList.add('col-sm-12');
  container.innerHTML = 
    [
      '<div class="card card-3">',
      '<div class="card-image">',
        '<a href=' + book.downloadLink + '><img src="' + book.cover + '" class="img-responsive col-mx-auto"></a>',
      '</div>',
      '<div class="card-header">',
        '<div class="card-title"><h5>' + book.title + '</h5></div>',
        '<div class="card-subtitle text-gray">' + book.author.join(', ') + '</div>',
      '</div>',
      '<div class="card-body">',
        '<p>ISBN: ' + book.isbn.join(', ') + '</p>',
        '<p>Year: ' + book.year + '</p>',
        '<p>Pages: ' + book.pages + '</p>',
        '<p>File Type: ' + book.extension + '</p>',
        '<p>Size: ' + book.size + '</p>',
      '</div>',
      '<div class="card-footer">',
        '<a href=' + book.downloadLink + '><button class="btn btn-primary">Download</button></a>',
      '</div>',
      '</div>'
    ].join('\n');
  
  return container;
}

function getIrcResults(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function () {
    var status = xhr.status;
    //if everything completed successfully
    if (status === 200) {
      displayIrcResults(xhr.response);
      document.getElementById('ircLoadMoreButton').classList.remove('hidden');
      document.getElementById('ircLoadMoreButton').classList.remove('disabled');
      document.getElementById('ircLoadMoreButton').innerText = 'Load More';
      document.getElementById('searchButton').innerText = 'Search';
      document.getElementById('searchButton').classList.remove('disabled');
    }
    else {
    }
  };
  xhr.send();
}

function displayIrcResults(response) {
  for(let book of response) {
    let listItem = document.createElement('li');
    listItem.innerHTML = '<p><a href=' + book.downloadLink + '>' + book.name
                          + '</a> Size: ' + book.size + '</p>';
    document.getElementById('ircResults').appendChild(listItem);
  }
}

function ircLoadMore() {
  document.getElementById('ircLoadMoreButton').innerText = 'Loading...';
  document.getElementById('ircLoadMoreButton').classList.add('disabled');
  ++ircPage;
  let url = 'https://www.jkomskis.com/ebooks/api/irc/search?query='
            + encodeURI(query).replace(/%20/g,'+')
            + '&page=' + libgenPage;
  getIrcResults(url);
}
