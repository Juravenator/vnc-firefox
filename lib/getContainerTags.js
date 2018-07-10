'use strict'

const drc = require('docker-registry-client');

module.exports = () => new Promise( (jep, nope) => {
  const client = drc.createClientV2({name: 'juravenator/vnc-firefox'});
  client.listTags( (err, repoInfo) => {
    client.close();
    err ? nope(err) : jep(repoInfo.tags);
  });
});
