#!/usr/bin/env node
'use strict'

const makeImage = require('./lib/makeImage');
const getFirefoxVersions = require('./lib/getFirefoxVersions');
const getContainerTags = require('./lib/getContainerTags');

Promise.all([getFirefoxVersions(), getContainerTags()])
.then( ([firefoxVersions, tags]) => {
  console.log(`${firefoxVersions.length} firefox versions, ${tags.length} existing tags`);
  const difference = firefoxVersions.filter( version => tags.indexOf(`${version.tag}`) == -1 );
  console.log(`${difference.length} tags need to be created:`, difference.map(d => d.tag));

  return {todo: difference, allFirefoxVersions: firefoxVersions};
})
.then( ({todo, allFirefoxVersions}) => todo.reduce( (p, versionInfo) => {
  return p = p.then( r => makeImage(versionInfo) );
}, makeImage({
  version: allFirefoxVersions[allFirefoxVersions.length-1].version,
  tag: 'latest'
}) ))
.then( promisechain => {
  console.log("all images created. now execute\ndocker login\ndocker push juravenator/vnc-firefox");
})
.catch( error => {
  console.error("a problem occured while creating docker images:", error);
  process.exit(1);
})
