#!/usr/bin/env node
// @ts-check
import { search } from "music-metadata-search";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { generateM3uPlaylist, removePlaylists } from "../lib/m3u.mjs";

const tagRegex = /#(([A-z]+-?)+)/g;

const path = process.argv.at(2);

if (path === undefined) {
  console.error("You must specify the path");
  process.exit(1);
}

/** @param {string} path */
export async function generatePlaylists(path) {
  const tracks = search(path, {});

  /** @type {Record<string, import('music-metadata-search').Track[]>} */
  const playlists = {};

  for await (const t of tracks) {
    for (const c of [t.comment, t.genre].filter(Boolean)) {
      if (!c) continue;
      for (const match of c.matchAll(tagRegex)) {
        const tag = match[0];
        playlists[tag] ??= [];
        playlists[tag].push(t);
      }
    }
  }

  for (const [tag, tracks] of Object.entries(playlists)) {
    const playlist = generateM3uPlaylist(tracks, tag, path);
    const playlistPath = join(path, `${tag}.m3u`);
    await writeFile(playlistPath, playlist, { encoding: "utf-8" });
  }
}

/**
 * @param {string} path
 */
async function main(path) {
  await removePlaylists(path);
  await generatePlaylists(path);
}

main(path).catch(console.error);
