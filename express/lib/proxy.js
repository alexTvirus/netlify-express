"use strict";

var URL = require("url"),
  http = require("http"),
  https = require("https"),
  _ = require("lodash"),
  contentTypes = require("./content-types.js"),
  debug = require("debug")("cac:proxy");

function proxy(config) {
  /**
   * Makes the outgoing request and relays it to the client, modifying it along the way if necessary
   */
  function proxyRequest(data, next) {
    // console.log("proxying %s %s", data.clientRequest.method, data.url);
    
      

     // uri.path = encodeURIComponent(uri.path);
    // console.log("proxying %s %s", data.clientRequest.method, data.url);
    var middlewareHandledRequest = _.some(
      config.requestMiddleware,
      function (middleware) {
        middleware(data);
        return data.clientResponse.headersSent; // if true, then _.some will stop processing middleware here because we can no longer
      }
    );
     var uri = URL.parse(data.url);
    if (!middlewareHandledRequest) {
      var options = {
        host: uri.hostname,
        port: uri.port,
        // path: "/"+encodeURIComponent(uri.path.slice(1)),
        path: uri.path,
        method: data.clientRequest.method,
        headers: data.headers,
      };
      
      // console.log(options)
      //set the agent for the request.
      if (uri.protocol == "http:" && config.httpAgent) {
        options.agent = config.httpAgent;
      }
      if (uri.protocol == "https:" && config.httpsAgent) {
        options.agent = config.httpsAgent;
      }

      // what protocol to use for outgoing connections.
      var proto = uri.protocol == "https:" ? https : http;

      // options.headers['sec-fetch-mode'] = 'cors'
      // options.headers['sec-fetch-user'] = '?1'
      // options.headers['referer'] = 'https://www.pornhub.com/view_video.php?viewkey=ph603697d30cc5b'
      // delete options.headers['sec-fetch-site']
      // if(options.host.includes("pornhub") && options.path.startsWith("/view_video.php"))
      //   options.method ="POST"

      data.remoteRequest = proto.request(options, function (remoteResponse) {
        data.remoteResponse = remoteResponse;
        data.remoteResponse.on("error", next);
        proxyResponse(data);
      });

      data.remoteRequest.on("error", next);

      // pass along POST data & let the remote server know when we're done sending data
      data.stream.pipe(data.remoteRequest);
    }
  }

  function proxyResponse(data) {
    debug(
      "proxying %s response for %s",
      data.remoteResponse.statusCode,
      data.url
    );

    // make a copy of the headers to fiddle with
    data.headers = _.cloneDeep(data.remoteResponse.headers);

    debug("remote response headers", data.headers);

    // create a stream object for middleware to pipe from and overwrite
    data.stream = data.remoteResponse;

    data.contentType = contentTypes.getType(data);

    var middlewareHandledResponse = _.some(
      config.responseMiddleware,
      function (middleware) {
        middleware(data);
        return data.clientResponse.headersSent; // if true, then _.some will stop processing middleware here
      }
    );

    if (!middlewareHandledResponse) {
      //  fire off out (possibly modified) headers
      data.clientResponse.writeHead(
        data.remoteResponse.statusCode,
        data.headers
      );
      data.stream.pipe(data.clientResponse);
    }
  }

  return proxyRequest;
}

module.exports = proxy;
