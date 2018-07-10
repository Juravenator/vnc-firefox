'use strict'

const jsdom = require("jsdom");

module.exports = () => new Promise( (jep, nope) => {
  jsdom.env(
    "https://download-installer.cdn.mozilla.net/pub/firefox/releases/",
    (err, window) => {
      if (err) {
        nope(err);
      }
      else {
        const links = window.document.querySelectorAll("body table tr td a");
        const versions = Object.keys(links)
        .map( n => links[n].textContent.slice(0,-1)); // remove trailing "/"

        const majorVersions = versions
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
