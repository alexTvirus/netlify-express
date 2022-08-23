"use strict";

/**
 * Adds an extra piece of middleware before and after EVERY other piece of middleware in the stack
 * Reports on what has changed
 *
 * enable by setting the DEBUG environment parameter to `cac:middleware`, `cac:*`, or `*`. For example:
 *
 *     DEBUG=cac:middleware node mycoolapp.js
 */

var Transform = require("stream").Transform;
var crypto = require("crypto");
var _ = require("lodash");


function getDebugMiddlewareFor(middleware, dir) {
  var nextName = middleware && (middleware.name || middleware.toString());
  return function debugMiddleware(data) {
    var prevMiddleware = data.middlewareName;
    if (!prevMiddleware) {

      data.prevStream = null;
    }
    if (
      !data.prevStream ||
      (data.prevStream && data.stream != data.prevStream)
    ) {
      data.prevStream = data.stream = data.stream.pipe(
        new Transform({
          decodeStrings: false,
          transform: function (chunk, encoding, next) {
            var hash = crypto.createHash("sha1").update(chunk).digest("hex");
            
            if (data.prevHash && hash != data.prevHash) {
              
            }
            data.hash = hash;
            this.push(chunk);
            next();
          },
        })
      );
    }
    if (nextName) {
      
      data.middlewareName = nextName;
    }
    if (prevMiddleware && !nextName) {
     
    }
  };
}

function debugMiddleware(middleware, dir) {
  return _(middleware)
    .map(function (m) {
      return [getDebugMiddlewareFor(m, dir), m];
    })
    .flatten()
    .push(getDebugMiddlewareFor(null, dir))
    .value();
}

module.exports.enabled = debug.enabled;
module.exports.debugMiddleware = debugMiddleware;
