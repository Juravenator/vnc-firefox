#!/usr/bin/env node

var jsdom = require("jsdom");
var http = require('http');
var fs = require('fs');
var drc = require('docker-registry-client');
var Docker = require('node-docker-api').Docker;
var docker = new Docker();
var tar = require('tar-fs');

var makeImage = versionInfo => {
  console.log("preparing to build image for firefox " + versionInfo.tag);
  return docker.image.build(tar.pack('.'), {
    t: `juravenator/vnc-firefox:${versionInfo.tag}`,
    buildargs: {FIREFOX_VERSION: `${versionInfo.version}`}
  })
  .then( stream => new Promise( (jep, nope) => {
    // stream.pipe(process.stdout); // junky output
    stream.on('data', o => {
      var lines = o.toString().split("\n").filter(line => line != '').map(line => JSON.parse(line));
      lines.forEach( line => {
        if (line.errorDetail) {
          nope(line.errorDetail)
        }
        else if (line.stream) {
          console.log(line.stream);
        }
      })
    })
    stream.on('end', r => jep(r))
    stream.on('error', error => nope(error))
  }))
  .then( () => {
    return docker.image.status(`juravenator/vnc-firefox:${versionInfo.tag}`);
  })
}

var getFirefoxVersions = new Promise( (jep, nope) => {
  jsdom.env(
    "https://download-installer.cdn.mozilla.net/pub/firefox/releases/",
    (err, window) => {
      if (err) {
        nope(err);
      }
      else {
        let links = window.document.querySelectorAll("body table tr td a");
        let versions = Object.keys(links)
        .map( n => links[n].textContent.slice(0,-1)); // remove trailing "/"

        var majorVersions = versions
        .filter( version => /^[0-9]+\.[0-9]+$/.exec(version)) // major versions only
        .map( version => ({
          version: version,
          tag: Number(/^[0-9]+/.exec(version)[0])
        }))
        .filter( version => version.tag >= 15) // 1-15 are ignored
        jep(majorVersions);
      }
    }
  );
});

var getContainerTags = new Promise( (jep, nope) => {
  var client = drc.createClientV2({name: 'juravenator/vnc-firefox'});
  client.listTags( (err, repoInfo) => {
    if (err) {
      nope(err);
    }
    else {
      client.close();
      jep(repoInfo.tags)
    }
  });
})

Promise.all([getFirefoxVersions, getContainerTags])
.then( ([firefoxVersions, tags]) => {
  console.log(`${firefoxVersions.length} firefox versions, ${tags.length} existing tags`);
  var difference = firefoxVersions.filter( version => tags.indexOf(`${version.tag}`) == -1 );
  console.log(`${difference.length} tags need to be created:`, difference.map(d => d.tag));

  return {todo: difference, allFirefoxVersions: firefoxVersions};
})
.then( ({todo, allFirefoxVersions}) => todo.reduce( (p, versionInfo) => {
  p = p.then( r => makeImage(versionInfo) );
  return p;
}, makeImage({
  version: allFirefoxVersions[allFirefoxVersions.length-1].version,
  tag: 'latest'
}) ))
.then( promisechain => {
  console.log("all images created. now execute\ndocker login\ndocker push juravenator/vnc-firefox");
})
.catch( error => console.error("a problem occured while creating docker images:", error))
