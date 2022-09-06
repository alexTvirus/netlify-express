//'use strict';
const nodestatic = require('node-static');
const distFolder = new nodestatic.Server('./public');
var url = require('url');
var querystring = require('querystring');
var Transform = require('stream').Transform;

var https = require('https');
var http = require('http');

const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
//app.use(bodyParser.json({limit: '50mb'}));
//app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.raw({type: 'application/octet-stream', limit: '2mb'}))
const {PromiseSocket} = require("promise-socket")
const fetch = require('node-fetch')
var params = function (req) {
  let q = req.url.split('?'), result = {};
  if (q.length >= 2) {
    q[1].split('&').forEach((item) => {
      try {
        result[item.split('=')[0]] = item.split('=')[1];
      } catch (e) {
        result[item.split('=')[0]] = '';
      }
    })
  }
  return result;
}

var request = function (opts, callback) {
  var req = (opts.protocol === 'https:' ? https : http).request(opts, callback);
  req.on('error', callback);
  return req;
};

function intervene (options, callback) {
  callback();
};

function proxyRequest( req ){

  // Buffer the request
  // TODO

  // Return a function once the authorization has been granted
  return function( options, res){

    var connector = request(options, proxyResponse.bind(null,res));
    req.pipe(connector, {end:true});
  }
}

function proxyResponse1(clientResponse,serverResponse){
  if( serverResponse instanceof Error ){
    return error(clientResponse);
  }
  if ( serverResponse.headers['transfer-encoding'] === 'chunked') {
    delete  serverResponse.headers['transfer-encoding']
  }

  let body = [];

  serverResponse.on("data", (chunk) => {
    body.push(chunk)
  });

  serverResponse.on("end", () => {
    body = Buffer.concat(body);
    //let s_b = Buffer.from(body).toString('base64')
    //data.headers["content-length"] = body.length

    clientResponse.writeHeader(serverResponse.statusCode, serverResponse.headers);

    clientResponse.write(body);
    clientResponse.end();
    //data.stream.pipe(data.clientResponse);
  });
}

function proxyResponse(clientResponse,serverResponse){
	if( serverResponse instanceof Error ){
		return error(clientResponse);
	}
	if ( serverResponse.headers['transfer-encoding'] === 'chunked') {
		delete  serverResponse.headers['transfer-encoding']
	}
	//if ( !serverResponse.headers['Access-Control-Allow-Credentials']) {
	//	serverResponse.headers['Access-Control-Allow-Origin'] = "*"
	//}
	clientResponse.writeHeader(serverResponse.statusCode, serverResponse.headers);
	serverResponse.pipe(clientResponse, {end:true});
}

function error(res){
  res.writeHead(400);
  res.end();
}

app.use((req, res) => {

   //console.log(req.url)

   //console.log(JSON.stringify(req.headers))


  let resourceURL = req.url.replace(/\/\.netlify\/functions\/server\//ig,'');

  let maindomain = req.headers['realip'] ? req.headers['realip'] : req.headers['host']


  //let realport = req.headers['realport'] ? req.headers['realport'] : 80

  //maindomain = "socbay.mobi"

  resourceURL = "https://" + maindomain + "/" + resourceURL

  //console.log(resourceURL)
  // Options
  var proxyOptions = url.parse(resourceURL);
  proxyOptions.headers = req.headers;
  proxyOptions.headers["Host"] = maindomain
  proxyOptions.headers["host"] = maindomain
  proxyOptions.method = req.method;
  proxyOptions.headers['x-request-id'] = Date.now()
  intervene(proxyOptions, proxyRequest(req).bind(null, proxyOptions, res));

});

module.exports = app;
module.exports.handler = serverless(app, {
  binary: ['application/json', 'image/*']
});
