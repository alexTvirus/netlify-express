'use strict';
const app = require('./express/server');

const options = {
  key: fs.readFileSync('./lib/test-ssl.local.key'),
  cert: fs.readFileSync('./lib/test-ssl.local.crt')
};
const https = require('https');
const server = https.createServer(options,app);



server.listen(3000, () => console.log('Local app listening on port 3000!'));
