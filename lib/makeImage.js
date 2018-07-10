'use strict'

const docker = require('./docker');
const tar = require('tar-fs');

module.exports = versionInfo => {
  console.log("preparing to build image for firefox " + versionInfo.tag);
  return docker.image.build(tar.pack('.'), {
    t: `juravenator/vnc-firefox:${versionInfo.tag}`,
    buildargs: {FIREFOX_VERSION: `${versionInfo.version}`}
  })
  .then( stream => new Promise( (jep, nope) => {
    // stream.pipe(process.stdout); // junky output
    stream.on('data', o => {
      o.toString()
        .split("\n")
        .filter(line => line != '')
        .map(line => JSON.parse(line))
        .forEach( line => {
          if (line.errorDetail) {
            nope(line.errorDetail)
          }
          else if (line.stream) {
            console.log(line.stream);
          }
        });
    })
    stream.on('end', r => jep(r))
    stream.on('error', error => nope(error))
  }))
  .then( () => {
    return docker.image.get(`juravenator/vnc-firefox:${versionInfo.tag}`).status();
  })
}
