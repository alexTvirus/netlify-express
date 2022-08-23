"use strict";




module.exports = function (config) {
  var URL = require("url");
  function proxyReferer(data) {
    // overwrite the referer with the correct referer
    if (data.headers.referer) {
      var uri = URL.parse(data.headers.referer);
      if (uri.path.substr(0, config.prefix.length) == config.prefix) {
        var ref = uri.path.substr(config.prefix.length);

        data.headers.referer = ref;
      }
    }
  }

  return proxyReferer;
};
