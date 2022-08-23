"use strict";



module.exports = function (/*config*/) {
  function hpkp(data) {
    // this could potentially block clients from using the proxy successfully.
    if (data.headers["public-key-pins"]) {

      delete data.headers["public-key-pins"];
    }
  }

  return hpkp;
};
