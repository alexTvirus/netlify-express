"use strict";


module.exports = function (/*config*/) {
  function csp(data) {
    // not removing csp could potentially prevent clients from using the proxy successfully.
    if (data.headers["content-security-policy"]) {
      delete data.headers["content-security-policy"];
    }
    if (data.headers["content-security-policy-report-only"]) {
      delete data.headers["content-security-policy-report-only"];
    }
  }

  return csp;
};
