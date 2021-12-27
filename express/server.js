//'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
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

app.post('/.netlify/functions/server/post', function(req, res) {
    var body = req.body;
    body = body.slice(2, body.length);
    req.params = params(req);
    var sessionid = req.params.sessionid.trim();
    if (global[sessionid]['client']) {
        try {
            global[sessionid]['client'].write(body);
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.end("ok");
        } catch (e) {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.end(e);
        }
    }
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end("notok");
});

app.get('/.netlify/functions/server/sse', function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    console.log(sessionid + " sse");
    req.params = params(req);
    var sessionid = req.params.sessionid;
    var ip = req.params.ip;
    var port = req.params.port;
    global[sessionid] = [];
    global[sessionid]['sessionid'] = sessionid.trim();
    global[sessionid]['ip'] = ip.trim();
    global[sessionid]['port'] = port;

    var client = new net.Socket();
    global[sessionid]['chunks'] = [];
    global[sessionid]['client'] = client;
    global[sessionid]['client'].connect(global[sessionid]['port'], global[sessionid]['ip'], function() {
        res.write("connect");
    });
    global[sessionid]['client'].on('data', function(data) {

        var x = data.toString('base64');
        var y = {
            "stack": x
        };
        var z = JSON.stringify(y)
        y = `data: ${z}\n\n`;
        res.write(y);

    });

    global[sessionid]['client'].on("end", function(err) {
        console.log("end");
        console.log(err);
    });

    global[sessionid]['client'].on("close", function(err) {
        delete global.sessionId;
        console.log("close");
        res.end();
        console.log(err);
    });

    global[sessionid]['client'].on("error", function(err) {
        //global[sessionid]['error']=true;
        console.log("error");
        console.log(err);
    });
});

const router = express.Router();
app.get('/.netlify/functions/server/', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
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
  `);
});

app.get('/.netlify/functions/server/another1', (req, res) => {

    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end(global[123123]['sessionid']);
});

app.get('/.netlify/functions/server/another2', (req, res) => {
    req.params = params(req);
    var sessionid = req.params.sessionid.trim();
    var str = req.params.str.trim();
    global[sessionid] = [];
    global[sessionid]['sessionid'] = str;
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end(str);
});

app.get('/.netlify/functions/server/test1', (req, res) => {
    client.write('GET / HTTP/1.0\r\n' +
        'Host: muthienlong.pro\r\n' +
        '\r\n');
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end();
});

app.get('/.netlify/functions/server/test2', (req, res) => {
    if (global2) {
        res.write(global2);
        res.end();
    } else {
        res.write('ko');
        res.end();
    }

});

app.get('/.netlify/functions/server/test3', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': '*'
    });

    res.write(`data: abc\n\n`);
});

app.get('/.netlify/functions/server/countdown', async (req, res) => {
    // res.removeHeader('server');
    // res.removeHeader('vary');
    //res.removeHeader('x-nf-request-id');
    //res.removeHeader('x-powered-by');

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': 'http://localhost'
    });


    try {
        const socket = new net.Socket()
        console.log('1');
        const promiseSocket = new PromiseSocket(socket)

        await socket.connect(80, "muhanoi.net")
        console.log('2');

        var s = 'GET /tin-tuc.html HTTP/1.0\r\n' +
            'Host: muhanoi.net\r\n' +
            '\r\n'

        await promiseSocket.write(new Buffer(s))
        console.log('3');
        chunkSize = 12020
        var x = "";
        let chunk = await promiseSocket.read();
        if (chunk) {
            global2 = "abc";
        }
        for (let chunk;
            (chunk = await promiseSocket.read());) {
            x = chunk.toString('base64');
            global2 = chunk.slice(chunk.length - 20, chunk.length).toString();
            res.write(`data: ${JSON.stringify(x)}\n\n`);
        }
        res.write(`data: end\n\n`);
        res.end();

    } catch (e) {
        //res.write("data: " + e + "\n\n");
        // res.end();
    }

})

app.get('/.netlify/functions/server/countdown1', (req, res) => {
    // res.removeHeader('server');
    // res.removeHeader('vary');
    //res.removeHeader('x-nf-request-id');
    //res.removeHeader('x-powered-by');

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': 'http://localhost'
    });


    try {
        var client = new net.Socket();

        client.connect(80, "alice35.pythonanywhere.com", function() {
            // the socks response must be made after the remote connection has been
            // established
            console.log('connect');
            client.write('GET / HTTP/1.1\r\n' +
                'Host: alice35.pythonanywhere.com\r\n' +
                '\r\n');
        });
        client.on('data', function(data) {
            try {
                //console.log(data.toString());
                //var y =data.toString();
                var x = data.toString('base64');
                console.log(x);
                if (data.toString().includes("</html>")) {
                    global2 = data.slice(data.length - 20, data.length).toString();
                    //res.write(`data: ${JSON.stringify(x)}\n\n`);
                }

            } catch (e) {

            }

        });



        client.on("end", function(err) {
            console.log("end");

            console.log(err);
        });

        client.on("close", function(err) {
            console.log("close");
            res.write(`data: end\n\n`);
            res.end();
            console.log(err);
        });

        client.on("error", function(err) {
            //global[sessionid]['error']=true;
            console.log("error");
            //res.end();
            console.log(err);
        });

    } catch (e) {
        //res.write("data: " + e + "\n\n");
        // res.end();
    }

})

app.get('/.netlify/functions/server/testx', (req, res) => {
    // res.removeHeader('server');
    // res.removeHeader('vary');
    //res.removeHeader('x-nf-request-id');
    //res.removeHeader('x-powered-by');

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': 'http://localhost'
    });


    try {
        var client = new net.Socket();

        client.connect(80, "muthienlong.pro", function() {
            // the socks response must be made after the remote connection has been
            // established
            console.log('connect');
            client.write('GET /?p=tintuc&id=236&tieude=THU---PET-VA-CAC-VAT-PHAM-KHAC-TRONG-MU-ONLINE  HTTP/1.0 \r\nHost:muthienlong.pro \r\n\r\n'
               );
        });
        client.on('data', function(data) {
            try {
                //console.log(data.toString());
                //var y =data.toString();
                var x = data.toString('base64');
                res.write(`data: ${JSON.stringify(x)}\n\n`);
            } catch (e) {

            }

        });



        client.on("end", function(err) {
            console.log("end");

            console.log(err);
        });

        client.on("close", function(err) {
            console.log("close");
            res.write(`data: end\n\n`);
            res.end();
            console.log(err);
        });

        client.on("error", function(err) {
            //global[sessionid]['error']=true;
            console.log("error");
            //res.end();
            console.log(err);
        });

    } catch (e) {
        //res.write("data: " + e + "\n\n");
        // res.end();
    }

})

app.get('/.netlify/functions/server/request-mymin', (req, res) => {
    // res.removeHeader('server');
    // res.removeHeader('vary');
    //res.removeHeader('x-nf-request-id');
    //res.removeHeader('x-powered-by');

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
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
                var x = payload.toString('base64');
                res.write(`data: ${JSON.stringify(x)}\n\n`);
            }).catch(err => {
                console.log(err);
                return false
            });

    } catch (e) {
        //res.write("data: " + e + "\n\n");
        res.end('loi ' + e);
    }

})


function countdown(res, count) {
    res.write("data: " + count + "\n\n");
    if (count)
        setTimeout(() => countdown(res, count - 1), 1000);
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
