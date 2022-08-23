//'use strict';
const nodestatic = require('node-static');
const distFolder = new nodestatic.Server('./public');
var url = require('url');
var querystring = require('querystring');
var Transform = require('stream').Transform;

const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
//app.use(bodyParser.json({limit: '50mb'}));
//app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.raw({type: 'application/octet-stream', limit : '2mb'}))
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

var cacConfig = {
    prefix: '/.netlify/functions/server/proxy/',
      requestMiddleware:[
        // blockAD(),
        //fixUrlOnGlit(),
        //fixPornhub(),
        
    ],
    responseMiddleware: [
        // injectScript({
        //     processContentTypes: ["text/html","text/plain"],
        // })
        // googleAnalyticsMiddleware()
    ],
};

app.use(cac(cacConfig));

// serve up static files *after* the proxy is run


// this is for users who's form actually submitted due to JS being disabled or whatever
app.get("/no-js", function(req, res) {
    // grab the "url" parameter from the querystring
    var site = querystring.parse(url.parse(req.url).query).url;
    // and redirect the user to /proxy/url
    res.redirect(cacConfig.prefix + site);
});

// app.get('/.netlify/functions/server/img', (req, res) => {
//   var dataUrl = "data:image/png;base64,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";
//    var dataUrlEdit = dataUrl.replace(/data:image\/png;base64,/, '');
//    var img = Buffer.from(dataUrlEdit, 'base64');
//    res.writeHead(200, {
//      'Content-Type': 'image/png',
//      'Content-Length': img.length
//    });
//    res.end(img);
//
//
// });
//
// app.get('/.netlify/functions/server/another1', (req, res) => {
//    console.log(req.url)
//    res.writeHead(200, { 'Content-Type': 'text/html' });
//    res.write("ok");
//   res.end();
// });

function cac(config) {
    //----------

    var url = require("url");
    var _ = require("lodash");

// expose all built-in middleware
    var host = require("./lib/host.js");
    var referer = require("./lib/referer.js");
    var cookies = require("./lib/cookies.js");
    var hsts = require("./lib/hsts.js");
    var hpkp = require("./lib/hpkp.js");
    var csp = require("./lib/csp.js");
    var redirects = require("./lib/redirects.js");
    var decompress = require("./lib/decompress.js");
    var charsets = require("./lib/charsets.js");
    var urlPrefixer = require("./lib/url-prefixer.js");
    var clientScripts = require("./lib/client-scripts.js");
    var metaRobots = require("./lib/meta-robots.js");
    var contentLength = require("./lib/content-length.js");

// these aren't middleware, but are still worth exposing
    var proxy = require("./lib/proxy.js");
    var contentTypes = require("./lib/content-types.js");
    var getRealUrl = require("./lib/get-real-url.js");
    var websockets = require("./lib/websockets.js");

     config = {
        prefix: "/.netlify/functions/server/proxy/",
        host: null, // can be used to override the url used in redirects
        requestMiddleware: [],
        responseMiddleware: [],
        standardMiddleware: false,
        clientScripts: false, // note: disabling standardMiddleware also disables clientScripts. It's mostly in a separate setting for testing
        processContentTypes: contentTypes.html.concat(
            contentTypes.css
        ),
    };


//----------



    if (config.prefix.substr(-1) != "/") {
        config.prefix += "/";
    }

    if (config.standardMiddleware !== false) {
        var host = host(config);
        var referer = referer(config);
        var cookies = cookies(config);
        var hsts = hsts(config);
        var hpkp = hpkp(config);
        var csp = csp(config);
        var redirects = redirects(config);
        var decompress = decompress(config);
        var charsets = charsets(config);
        var urlPrefixer = urlPrefixer(config);
        var metaRobots = metaRobots(config);
        var contentLength = contentLength(config);

        // this applies to every request that gets proxied
        config.requestMiddleware = [
            host,
            referer,
            decompress.handleRequest,
            cookies.handleRequest,
        ].concat(config.requestMiddleware);

        config.responseMiddleware = [
            // hsts,
            // hpkp,
            // csp,
            // redirects,
            // decompress.handleResponse,
            // charsets,
            // urlPrefixer,
            // cookies.handleResponse,
            // metaRobots,
        ].concat(config.responseMiddleware, [contentLength]);

        // var clientScripts;
        // if (config.clientScripts) {
        //     // insert clientScripts after the urlPrefixer
        //     clientScripts = clientScripts(config);
        //     const position = config.responseMiddleware.indexOf(urlPrefixer) + 1;
        //     config.responseMiddleware.splice(position, 0, clientScripts.injector);
        // }
    }

    // the middleware debugger logs details before/after each piece of middleware



    var proxy = proxy(config);

    var getRealUrl = getRealUrl(config);

    /**
     * This is what makes this server magic: if we get an unrecognized request that wasn't corrected by
     * proxy's filter, this checks the referrer to determine what the path should be, and then issues a
     * 307 redirect to a proxied url at that path
     *
     * 307 redirects cause the client to re-use the original method and body at the new location
     */
    function recoverTargetUrl(request) {
        if (request.url.indexOf(config.prefix) === 0) {
            // handles /proxy/ and /proxy
            if (
                request.url == config.prefix ||
                request.url == config.prefix.substr(0, config.prefix.length - 1)
            ) {
                return null;
            }
            // handles cases like like /proxy/google.com and redirects to /proxy/http://google.com/
            return "http://" + request.url.substr(config.prefix.length);
        }

        // if there is no referer, then either they just got here or we can't help them
        if (!request.headers.referer) {
            return null;
        }

        var ref = url.parse(request.headers.referer);

        // if we couldn't parse the referrer or they came from another site, they send them to the home page
        if (!ref || ref.host != thisHost(request)) {
            return null;
        }

        // now we know where they came from, so we can do something for them
        if (ref.pathname.indexOf(config.prefix + "http") === 0) {
            var real_url = getRealUrl(ref.pathname);
            var real_uri = url.parse(real_url);
            var target_url = real_uri.protocol + "//" + real_uri.host + request.url;
             // now, take the requested pat on the previous known host and send the user on their way
            return target_url;
        }

        // fallback - there was a referer, but it wasn't one that we could use to determine the correct path
        return null;
    }

    // returns the configured host if one exists, otherwise the host that the current request came in on
    function thisHost(request) {
        if (config.host) {
            return config.host;
        } else {
            return request.headers.host; // normal case: include the hostname but assume we're either on a standard port or behind a reverse proxy
        }
    }

    // returns the http://site.com/proxy
    function thisSite(request) {
        // default to express's more advanced version of this when available (handles X-Forwarded-Protocol headers)
        const proto =
            request.protocol ||
            request.headers["X-Forwarded-Protocol"] ||
            (request.connection.encrypted ? "https" : "http");
        return proto + "://" + thisHost(request) + config.prefix;
    }

    function redirectTo(request, response, site, headers) {
        site = site || "";
        if (site.substr(0, 1) == "/") {
            site = site.substr(1);
        }
        if (site.substr(0, config.prefix.length) == config.prefix) {
            // no /proxy/proxy redirects
            site = site.substr(config.prefix.length);
        }
        var location = request.thisSite() + site;
        try {
            response.writeHead(
                307,
                _.defaults(headers || {}, {
                    Location: location,
                })
            );
        } catch (ex) {
            // Most likely because the headers were already sent
            console.error("Failed to send redirect", ex);
        }
        response.end();
    }

    function initData(clientRequest, clientResponse, clientSocket) {
        // convenience methods
        clientRequest.thisHost = thisHost.bind(thisHost, clientRequest);
        clientRequest.thisSite = thisSite.bind(thisSite, clientRequest);

        var uri,
            formatted = null;
        var url_data = url.parse(clientRequest.url);
        var rawUrl = clientRequest.url.substr(config.prefix.length);

        // todo: consider supporting ws here for websockets
        if (url_data.pathname.indexOf(config.prefix + "http") === 0) {
            uri = url.parse(getRealUrl(clientRequest.url));
            formatted = url.format(uri);
        } else {
            var target = recoverTargetUrl(clientRequest);
            if (target) {
                // redirecting is dificult here, and doesn't add much value, so just use the recovered target url
                uri = url.parse(target);
                formatted = url.format(uri);
            }
        }

        // todo: check the TLD to handle cases where a client requested ../img.jpg from the root and this gets translated to /proxy/http://img.jpg by the browser.
        // (surviv.io does this)

        // This is how api consumers can hook into requests.
        // The data object is passed to all requestMiddleware before the request is sent to the remote server,
        // and it is passed through all responseMiddleware before being sent to the client.
        var data = {
            url: formatted,
            uri,
            rawUrl,
            clientRequest,
            clientResponse,
            headers: _.cloneDeep(clientRequest.headers),
            stream: clientRequest,
            isWebsocket: !!clientSocket,
            clientSocket,
        };

        return data;
    }

    // todo: see if this can be synchronous
    const clientScriptsServer = config.clientScripts
        ? clientScripts.server
        : (req, res, next) => next();

    // regular web requests
    function handleRequest(clientRequest, clientResponse, next) {
        const data = initData(clientRequest, clientResponse);

        clientScriptsServer(clientRequest, clientResponse, (err) => {
            if (err) return next(err);

            clientResponse.redirectTo = redirectTo.bind(
                redirectTo,
                clientRequest,
                clientResponse
            );

            if (!next) {
                next = function () {
                    clientResponse.writeHead(400);
                    clientResponse.end("Unable to process request");
                };
            }

            const formatted = data.url;
            const raw = data.rawUrl;

            if (formatted) {
                // If the raw URL isn't quite right, but we can figure it out, redirect to the correct URL.
                // Special exception for cases where routers collapsed slashes (see #130)
                if (formatted !== raw && formatted.replace("://", ":/") !== raw) {
                    return clientResponse.redirectTo(formatted);
                }
                proxy(data, next);
            } else {
                next();
            }
        });
    }

    // websocket support
    const proxyWebsocket = websockets(config);

    handleRequest.onUpgrade = function onUpgrade(
        clientRequest,
        clientSocket,
        clientHead
    ) {

        const data = initData(clientRequest, null, clientSocket);

        data.clientHead = clientHead;

        if (data.url) {
            proxyWebsocket(data);
        } else {
            // nothing else to do, we don't know where the websocket is supposed to go.
            clientSocket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
        }
    };

    return handleRequest;
}





module.exports = app;
module.exports.handler = serverless(app,{
    binary: ['application/json', 'image/*']
  });
