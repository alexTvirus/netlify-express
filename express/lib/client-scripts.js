"use strict";

var path = require("path");
var Transform = require("stream").Transform;
var send = require("send");
var contentTypes = require("./content-types");

module.exports = function ({ prefix }) {
  const clientDir = "client";
  const clientScriptPathWeb = prefix + clientDir + "/cac-client.js";
  const clientScriptPathFs = path.join(
    __dirname,
    clientDir,
    "cac-client.js"
  );
  const isProduction = process.env.NODE_ENV === "production";
  const sendOpts = {
    acceptRanges: false,
    immutable: isProduction,
    index: false,
    maxAge: "10m",
  };

  function server(req, res, next) {
    if (req.url === clientScriptPathWeb) {
      send(req, clientScriptPathFs, sendOpts).pipe(res);
      return;
    }
    next();
  }

  function injector(data) {
    if (contentTypes.html.includes(data.contentType)) {
      let isAdd =false
      data.stream = data.stream.pipe(
        new Transform({
          decodeStrings: false,
          transform: function (chunk, encoding, next) {
            // todo: only inject once (maybe make an "injects into head" helper)
            var updated = chunk.toString();
            var replaced = updated.search(/(<head[^>]*>)/i) >= 0;
            if (isAdd ) {
              this.push(chunk, "utf8");
              next();
            }else if(replaced){
              isAdd = true
              updated=updated.replace(
                  /(<head[^>]*>)/i,
                  `$1
<script src="${clientScriptPathWeb}"></script>
<script>cacInit(${JSON.stringify({
                    prefix,
                    url: data.url,
                  })}, window);</script>
`
              );
              this.push(updated, "utf8");
              next();
            }
          },
        })
      );
    }
  }

  return {
    server,
    injector,
  };
};
