#!/usr/bin/env node
// @ts-check
import { generatePlaylists, removePlaylists } from "./lib.mjs";

const path = process.argv.at(2);

if (path === undefined) {
  console.error("You must specify the path");
  process.exit(1);
}

/**
 * @param {string} path
 */
async function main(path) {
  await removePlaylists(path);
  await generatePlaylists(path);
}

main(path).catch(console.error);
