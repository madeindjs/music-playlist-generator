#!/usr/bin/env node
// @ts-check
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { generateM3uPlaylist } from "../lib/m3u.mjs";
import {
  getWeeklyJam,
  searchTracksFromListenBrainzPlaylist,
} from "../lib/listenbrain.mjs";

const path = process.argv.at(2);

if (path === undefined) {
  console.error("You must specify the path");
  process.exit(1);
}

const weeklyJam = await getWeeklyJam();
const playlistId = weeklyJam.identifier.replace(
  "https://listenbrainz.org/playlist/",
  "",
);

const localTracks = await searchTracksFromListenBrainzPlaylist(
  path,
  playlistId,
);

const m3u = generateM3uPlaylist(
  localTracks.filter(Boolean),
  weeklyJam.title,
  path,
);

const playlistPath = join(path, "listenbrainz-weekly-jam.m3u");
await writeFile(playlistPath, m3u, { encoding: "utf-8" });
console.log(playlistPath);
