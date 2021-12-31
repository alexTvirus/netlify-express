//'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
var url = require('url');
const bodyParser = require('body-parser');
const axios = require('axios');
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var merge = require('lodash');
const path = require('path');
var maindomain = "hpjav.tv";
var access_controls_headers = {'Access-Control-Allow-Origin': "*"};
//app.use(bodyParser.json({limit: '50mb'}));
//app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.raw({
    type: 'application/octet-stream',
    limit: '2mb'
}))
const {
    PromiseSocket
} = require("promise-socket")
var global = {};
var global2 = "";
var https = require('https');
var net = require('net');
var client;
var params = function(req) {
    let q = req.url.split('?'),
        result = {};
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

function myMiddleware (req, res, next) {
   // Maintain a collection of URL overriding parameters
	var params = {};
  var maindomain = "hpjav.tv";
	// Is the entire path the request?
	// i.e. http://proxy-server/http://thirdparty.com/request/to/be/proxied
	//var resourceURL = req.url.replace(/\/\.netlify\/functions\/server\//ig,'');
  var resourceURL = req.url.replace(/\/\.netlify\/functions\/server\//ig,'');
// Options
	resourceURL = "https://"+maindomain+"/"+resourceURL
	//res.end("resourceURL "+resourceURL);
	var proxyOptions = url.parse(resourceURL);
	proxyOptions.headers = {};
	merge.merge( proxyOptions.headers, req.headers, querystring.parse( params.headers ) );
	proxyOptions.method = params.method || req.method;
	proxyOptions.agent = false;

	// remove unwanted headers in the request
	delete proxyOptions.headers.host;

	delete proxyOptions.headers['accept-encoding'];
  delete proxyOptions.headers['if-none-match'];
	delete proxyOptions.headers['if-modified-since'];
	proxyOptions.url = resourceURL
	// Augment the request
	// Lets go and see if the value in here matches something which is stored locally
	// proxyOptions.headers['user-agent']='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36';
	// Augment the request
	// Lets go and see if the value in here matches something which is stored locally
  //res.end(resourceURL);
	const options = {
		url: proxyOptions.url,
		method: proxyOptions.method,
		headers: proxyOptions.headers
	}
		axios(options)
		.then(response => {
			payload = response.data;
			//var x = payload.toString('base64');
       if (response.headers['transfer-encoding'] === 'chunked') {
        delete response.headers['transfer-encoding']
      }
      if (response.headers['content-type']&&response.headers['content-type'].includes('text')) {
        payload=updateLinksInHTML(payload);
        payload=updateSrcInHTML(payload);
      }else if(!response.headers['content-type']){
        payload=updateLinksInHTML(payload);
        payload=updateSrcInHTML(payload);
      }
      
			res.writeHead(response.status,response.headers);
			//res.write(payload);
			//res.write(`data: ${JSON.stringify(x)}\n\n`);
			res.end(payload);
		}).catch(err => {
		console.log(err);
		res.end(err);
		//return false
	});
}

function updateLinksInHTML(html) {
  return html.replace(/href="(.*?)"/g, (match, $1) => { // g flag to replace all links
    return 'href="/.netlify/functions/server' + $1 + '"'; // return the string with your format
  })
}

function updateSrcInHTML(html) {
  return html.replace(/src="\/(.*?)"/g, (match, $1) => { // g flag to replace all links
    return 'src=".netlify/functions/server' + $1 + '"'; // return the string with your format
  })
}

app.use(myMiddleware)

intervene = function (options, callback) {
    callback();
};

var request = function (opts, callback) {
    var pro = (opts.protocol === 'https:' ? https : http);
    var req = pro.request(opts, callback);
    req.on('error', callback);
    return req;
};

function proxyRequest(req) {

    // Buffer the request
    // TODO

    // Return a function once the authorization has been granted
    return function (options, res) {

        var connector = request(options, proxyResponse.bind(null, res));
        req.pipe(connector, {end: true});
    }
}


function proxyResponse(clientResponse, serverResponse) {
    var headers = {};
    if (serverResponse instanceof Error) {
        return error(clientResponse);
    }
    merge.merge(headers, serverResponse.headers, access_controls_headers);
    clientResponse.writeHeader(serverResponse.statusCode, headers);
    serverResponse.pipe(clientResponse, {end: true});
}

function error(res) {
    res.writeHead(400, access_controls_headers);
    res.end();
}


//--------------------------




app.get('/.netlify/functions/server/request-mymin', (req, res) => {
    // res.removeHeader('server');
    // res.removeHeader('vary');
    //res.removeHeader('x-nf-request-id');
    //res.removeHeader('x-powered-by');

    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': '*'
    });


    try {
        const options = {
            url: 'https://mymin.net/mcoin',
            method: 'GET',
            headers: {
                'Host': 'mymin.net',
                'Connection': 'close',
                'Upgrade-Insecure-Requests': 1,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Language': 'vi,en-GB;q=0.9,en;q=0.8',
                'Cookie': 'PHPSESSID=f0clhvuje08ed51cjvvqv0b4f5; _ga=GA1.2.1662541345.1640626287; _gid=GA1.2.1135241609.1640626287; user_id=28357; user_key=Y9%2BGNPzcOJGS1qkwTuSoSW%2Bvcd%2F94YOtM%2BSQhx6Qn%2F8%3D; uss_auth_login=pBkJ0YVssBV%2BRW3jSQgrojKLdWClrie7uYOrfMnoD%2FW9Hg17CK7aRWhmQE8uHhEJ4PrPfxfEZ5mqbADAoLKiCxOo8bMyH0hsHThJBLVCMiaVZlYnhvvk08HMSN24zRNEaeWCbZ4zdaOigrh9d6fIrHe%2Fx41zvYXuTI2hSM46w7jxKWWvtZdb9mxWuQwT%2BOzHqTm1yXDBae3QW5T42B4Zwg%3D%3D; _gat=1mymin-ex: 4.2.0'
            }
        }


        axios(options)
            .then(response => {

                payload = response.data;
                //var x = payload.toString('base64');
                res.write(payload);
                //res.write(`data: ${JSON.stringify(x)}\n\n`);
                res.end('end ');
            }).catch(err => {
                console.log(err);
                return false
            });

    } catch (e) {
        //res.write("data: " + e + "\n\n");
        res.end('loi ' + e);
    }

})

app.get('/.netlify/functions/server/request-mymin/changeinfo/email', (req, res) => {
    // res.removeHeader('server');
    // res.removeHeader('vary');
    //res.removeHeader('x-nf-request-id');
    //res.removeHeader('x-powered-by');

    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': '*'
    });


    try {
        const options = {
            url: 'https://mymin.net/lethienlong-16064/changeinfo/email',
            method: 'GET',
            headers: {
                'Host': 'mymin.net',
                'Connection': 'close',
                'Upgrade-Insecure-Requests': 1,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Language': 'vi,en-GB;q=0.9,en;q=0.8',
                'Cookie': 'PHPSESSID=f0clhvuje08ed51cjvvqv0b4f5;user_id=28357; user_key=Y9%2BGNPzcOJGS1qkwTuSoSW%2Bvcd%2F94YOtM%2BSQhx6Qn%2F8%3D; uss_auth_login=pBkJ0YVssBV%2BRW3jSQgrojKLdWClrie7uYOrfMnoD%2FW9Hg17CK7aRWhmQE8uHhEJ4PrPfxfEZ5mqbADAoLKiCxOo8bMyH0hsHThJBLVCMiaVZlYnhvvk08HMSN24zRNEaeWCbZ4zdaOigrh9d6fIrHe%2Fx41zvYXuTI2hSM46w7jxKWWvtZdb9mxWuQwT%2BOzHqTm1yXDBae3QW5T42B4Zwg%3D%3D; _gat=1mymin-ex: 4.2.0'
            }
        }


        axios(options)
            .then(response => {

                payload = response.data;
                //var x = payload.toString('base64');
                res.write(payload);
                //res.write(`data: ${JSON.stringify(x)}\n\n`);
                res.end('end ');
            }).catch(err => {
                console.log(err);
                return false
            });

    } catch (e) {
        //res.write("data: " + e + "\n\n");
        res.end('loi ' + e);
    }

})

app.get('/.netlify/functions/server/request-mymin/lethienlong-16064', (req, res) => {
    // res.removeHeader('server');
    // res.removeHeader('vary');
    //res.removeHeader('x-nf-request-id');
    //res.removeHeader('x-powered-by');

    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': '*'
    });


    try {
        const options = {
            url: 'https://mymin.net/lethienlong-16064',
            method: 'GET',
            headers: {
                'Host': 'mymin.net',
                'Connection': 'close',
                'Upgrade-Insecure-Requests': 1,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Language': 'vi,en-GB;q=0.9,en;q=0.8',
                'Cookie': 'PHPSESSID=f0clhvuje08ed51cjvvqv0b4f5;user_id=28357; user_key=Y9%2BGNPzcOJGS1qkwTuSoSW%2Bvcd%2F94YOtM%2BSQhx6Qn%2F8%3D; uss_auth_login=pBkJ0YVssBV%2BRW3jSQgrojKLdWClrie7uYOrfMnoD%2FW9Hg17CK7aRWhmQE8uHhEJ4PrPfxfEZ5mqbADAoLKiCxOo8bMyH0hsHThJBLVCMiaVZlYnhvvk08HMSN24zRNEaeWCbZ4zdaOigrh9d6fIrHe%2Fx41zvYXuTI2hSM46w7jxKWWvtZdb9mxWuQwT%2BOzHqTm1yXDBae3QW5T42B4Zwg%3D%3D; _gat=1mymin-ex: 4.2.0'
            }
        }


        axios(options)
            .then(response => {

                payload = response.data;
                //var x = payload.toString('base64');
                res.write(payload);
                //res.write(`data: ${JSON.stringify(x)}\n\n`);
                res.end('end ');
            }).catch(err => {
                console.log(err);
                return false
            });

    } catch (e) {
        //res.write("data: " + e + "\n\n");
        res.end('loi ' + e);
    }

})





//router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
//router.post('/', (req, res) => res.json({ postBody: req.body }));

//app.use(bodyParser.json());
//app.use('/.netlify/functions/server', router);  // path must route to lambda
//app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
