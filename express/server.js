'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
//app.use(bodyParser.json({limit: '50mb'}));
//app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.raw({type: 'application/octet-stream', limit : '2mb'}))

var global = {};

var net = require('net');

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

app.post('/.netlify/functions/server/post', function (req, res) {
        var body = req.body;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        if(body){
          var s = body.slice(2,body.length).toString();
          res.end(s);
        }else{
          res.end("ko");
        }
        
        //req.params=params(req);
        //var sessionid = req.params.sessionid.trim();
        //if (global[sessionid]['client']) {
        //    try {
        //      res.writeHead(200, { 'Content-Type': 'text/html' });
        //      res.end(global[sessionid]['sessionid']);
                //console.log(global[sessionid]['sessionid']);
        //        global[sessionid]['client'].write(body);
        //    } catch (e) {
       //           res.writeHead(200, { 'Content-Type': 'text/html' });
        //          res.end(e);
         //   }
       // }
     // res.writeHead(200, { 'Content-Type': 'text/html' });
      //res.end();
});

app.get('/.netlify/functions/server/sse', function (req, res) {
		res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive',
		'Access-Control-Allow-Origin': '*'
		});
		 console.log(sessionid+" sse");
        req.params = params(req);
        var sessionid = req.params.sessionid;
        var ip = req.params.ip;
        var port = req.params.port;
        global[sessionid] = [];
        global[sessionid]['sessionid'] = sessionid.trim();
        global[sessionid]['ip'] = ip.trim();
        global[sessionid]['port'] = port;

        var client = new net.Socket();
        global[sessionid]['chunks']=[];
        global[sessionid]['client'] = client;
        global[sessionid]['client'].connect(global[sessionid]['port'], global[sessionid]['ip'], function () {

        });
        global[sessionid]['client'].on('data', function (data) {

                var x = data.toString('base64');
                //var y = {"stack" : x};
                //var z = JSON.stringify(y)
                 y = `data: ${x}\n\n`;
                res.write(y);
  
            }
        );

        global[sessionid]['client'].on("end", function (err) {
            console.log("end");
            console.log(err);
        });

        global[sessionid]['client'].on("close", function (err) {
			delete global.sessionId;
            console.log("close");
			res.end();
            console.log(err);
        });

        global[sessionid]['client'].on("error", function (err) {
            //global[sessionid]['error']=true;
            console.log("error");
            console.log(err);
        });
    });

const router = express.Router();
app.get('/.netlify/functions/server/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
<head>
  <script>
  if (!!window.EventSource) {
    var source = new EventSource('/.netlify/functions/server/countdown')

    source.addEventListener('message', function(e) {
      document.getElementById('data').innerHTML = e.data
    }, false)

    source.addEventListener('open', function(e) {
      document.getElementById('state').innerHTML = "Connected"
    }, false)

    source.addEventListener('error', function(e) {
      const id_state = document.getElementById('state')
      if (e.eventPhase == EventSource.CLOSED)
        source.close()
      if (e.target.readyState == EventSource.CLOSED) {
        id_state.innerHTML = "Disconnected"
      }
      else if (e.target.readyState == EventSource.CONNECTING) {
        id_state.innerHTML = "Connecting..."
      }
    }, false)
  } else {
    console.log("Your browser doesn't support SSE")
  }
  </script>
</head>
<body>
  <h1>SSE: <span id="state"></span></h1>
  <h3>Data: <span id="data"></span></h3>
</body>
</html>
  `
  );
});

app.get('/.netlify/functions/server/another1', (req, res) => {
   
   res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(global[123123]['sessionid']);
});

app.get('/.netlify/functions/server/another2', (req, res) => {
        req.params = params(req);
        var sessionid = req.params.sessionid.trim();
        var str = req.params.str.trim();
        global[sessionid] = [];
        global[sessionid]['sessionid'] = str;
   res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(str);
});

app.get('/.netlify/functions/server/countdown', (req, res) => {
    res.removeHeader('server');
    res.removeHeader('vary');
  res.removeHeader('x-nf-request-id');
  res.removeHeader('x-powered-by');
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  
	  try {
  var client = new net.Socket();
  client.connect(80, "muthienlong.pro", function () {
                    // the socks response must be made after the remote connection has been
                    // established
					console.log('connect');
					client.write('GET / HTTP/1.0\r\n' +
             'Host: muthienlong.pro\r\n' +
              '\r\n');
   });
  client.on('data', function (data) {
                          try {
							  //console.log(data.toString());
							  //var y =data.toString();
							  var x = data.toString('base64');
							  console.log(x);
                            res.write(`data: ${JSON.stringify(x)}\n\n`);
                          }catch (e) {

                          }

                        });      

client.on("end", function (err) {
                    console.log("end");
					//global[sessionid]['error']=true;
                    console.log(err);
                });

                client.on("close", function (err) {
                    console.log("close");
                    res.end();
                    console.log(err);
                });

                client.on("error", function (err) {
                    //global[sessionid]['error']=true;
                    console.log("error");
					res.end();
                    console.log(err);
                });						
                            
                          }catch (e) {
                            res.write("data: " + e + "\n\n");
                            res.end();
                          }
  
  
  
  //countdown(res, 2);
})

function countdown(res, count) {
  res.write("data: " + count + "\n\n");
  if (count)
    setTimeout(() => countdown(res, count-1), 1000);
  else
    res.end();
}



//router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
//router.post('/', (req, res) => res.json({ postBody: req.body }));

//app.use(bodyParser.json());
//app.use('/.netlify/functions/server', router);  // path must route to lambda
//app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
