const request = require('request');
var irc = require('xdcc').irc;
var ProgressBar = require('progress');

const host = 'http://localhost:8002';

async function getIrcResults(res, query, page) {
  console.log('Getting search results from IxIRC...');
  let ixIrxResults = await getIxIrcResults(query, page);
  console.log('Getting search results from SunXDCC...');
  let sunXdccResults = await getSunXdccResults(query, page);
  console.log('Merging lists...');
  for(let newEntry of sunXdccResults) {
    let add = true;
    for(let addedEntry of ixIrxResults) {
      if(newEntry.downloadLink.toLowerCase() == addedEntry.downloadLink.toLowerCase()) {
        add = false;
      }
    }
    if(add) {
      ixIrxResults.push(newEntry);
    }
  }

  console.log('Returning results...');
  res.json(ixIrxResults);
}

function getIxIrcResults(query, page) {
  return new Promise((resolve, reject) => {
    request(
      'http://ixirc.com/api/?q=' + query + '&pn=' + page,
      (error, response, body) => {
        console.log('Got results from IxIRC, parsing...');
        let parsed = JSON.parse(response.body);
        let results = parseIxIrcSearchResults(parsed.results);
        console.log('Parsed, resolving...');
        resolve(results);
      }
    );
  });
}

function parseIxIrcSearchResults(data) {
  let parsed = [];
  if(data == null)
    return parsed;
  for(let result of data) {
    if(result.name.slice((result.name.lastIndexOf(".") - 1 >>> 0) + 2) != 'epub'){
      continue;
    }
    let downloadLink = host + pathPrefix + '/irc/download?network=' + result.naddr
                        + '&channel=' + encodeURIComponent(result.cname)
                        + '&bot=' + encodeURIComponent(result.uname)
                        + '&pack=' + encodeURIComponent(result.n);
    let entry = {
      name: result.name,
      size: result.szf,
      downloadLink: downloadLink
    }
    parsed.push(entry);
  }

  return parsed;
}

function getSunXdccResults(query, page) {
  return new Promise((resolve, reject) => {
    request(
      'http://sunxdcc.com/deliver.php?sterm=' + query + '&page=' + page,
      (error, response, body) => {
        console.log('Got results from IxIRC, parsing...');
        let parsed = JSON.parse(response.body);
        let results = parseSunXdccSearchResults(parsed);
        console.log('Parsed, resolving...');
        resolve(results);
      }
    );
  });
}

function parseSunXdccSearchResults(data) {
  let parsed = [];
  if(data == null)
    return parsed;
  for(let i = 0; i < data.network.length; ++i) {
    if(data.fname[i].slice((data.fname[i].lastIndexOf(".") - 1 >>> 0) + 2) != 'epub'){
      continue;
    }
    let downloadLink = host + '/irc/download?network=' + data.network[i]
                        + '&channel=' + encodeURIComponent(data.channel[i])
                        + '&bot=' + encodeURIComponent(data.bot[i])
                        + '&pack=' + encodeURIComponent(data.packnum[i].substring(1));
    let entry = {
      name: data.fname[i],
      size: data.fsize[i].substring(1, data.fsize[i].length-1),
      downloadLink: downloadLink
    }
    parsed.push(entry);
  }

  return parsed;
}

function download(res, network, channel, bot, pack){
  let user = 'User_' + Math.random().toString(36).substr(7, 3);
  let progress;
  
  console.log('Connecting...');
  var client = new irc.Client(network, user, {
    channels: [ channel ],
    //userName: user,
    //realName: user
  });

  client.on('join', function(channel, nick, message) {
    if (nick !== user) return;
    console.log('Joined', channel);
    client.getXdcc(bot, 'xdcc send #' + pack, './temp');
  });

  client.on('xdcc-connect', function(meta) {
    console.log('Connected: ' + meta.ip + ':' + meta.port);
    progress = new ProgressBar('Downloading... [:bar] :percent, :etas remaining', {
      incomplete: ' ',
      total: meta.length,
      width: 20
    });
  });

  var last = 0;
  client.on('xdcc-data', function(received) {
    progress.tick(received - last);
    last = received;
  });

  client.on('xdcc-end', function(received, details) {
    console.log('Download completed');
    res.download('temp/' + details.file, details.file);
  });

  client.on('notice', function(from, to, message) {
    if (to == user && from == bot) {
      console.log("[notice]", message);
    }
  });

  client.on('error', function(message) {
    console.error(message);
  });
}

module.exports = {
  getIrcResults: getIrcResults,
  download: download
};