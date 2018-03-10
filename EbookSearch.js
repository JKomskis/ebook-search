#!/usr/bin/env node

// server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const exec = require('child_process').exec;
const libgen = require('./libgen.js');
const irc = require('./irc.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const port = 8002;
app.listen(port, () => {
  console.log('Server running on port ' + port);
});

app.get('/libgen/search', (req, res) => {
  console.log('Searching library genesis for ' + req.query.query);
  let query = req.query.query;
  query = encodeURI(req.query.query).replace(/%20/g,'+');
  libgen.getLibgenResults(res, query, req.query.page);
});

app.get('/libgen/download', (req, res) => {
  console.log('Fetching download link for ' + req.query.md5);
  let md5 = req.query.md5;

  libgen.downloadRedirect(res, md5);
});

app.get('/irc/search', (req, res) => {
  console.log('Searching IRC for ' + req.query.query);
  let query = req.query.query;
  query = encodeURI(req.query.query);
  irc.getIrcResults(res, query, req.query.page);
});

app.get('/irc/download', (req, res) => {
  console.log('Downloading pack #' + req.query.pack + ' from ' + req.query.bot
              + ' on channel ' + req.channel.channel + ' at ' + req.query.network);
  console.log(req.query);
  let network = req.query.network;
  let channel = req.query.channel;
  let bot = req.query.bot;
  let pack = req.query.pack;

  irc.download(res, network, channel, bot, pack);
});