"use strict";



module.exports = function (/*config*/) {

  return function hostHeader(data) {
    var URL = require("url");
    data.headers.host = URL.parse(data.url).host;
    // data.headers.host = "";
  };
};
