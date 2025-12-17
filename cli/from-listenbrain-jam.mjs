#!/usr/bin/env node
// @ts-check
import { search } from "music-metadata-search";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { generateM3uPlaylist } from "../lib/m3u.mjs";
import { getWeeklyJam, getPlaylistTracks } from "../lib/listenbrain.mjs";

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
const tracks = await getPlaylistTracks(playlistId);
const localTracks = [];
for await (const track of search(path, {})) {
  if (!track.musicbrainzRecordingId) continue;
  const index = tracks.findIndex(
    (t) => t.recordId === track.musicbrainzRecordingId,
  );
  if (index === -1) continue;
  localTracks[index] = track;
}

for (let i = 0; i < tracks.length; i++) {
  if (localTracks[i] === undefined) {
    const track = tracks[i];
    console.warn(
      `Cannot find ${track.author} - ${track.title} (${track.recordId})`,
    );
  }
}

const m3u = generateM3uPlaylist(
  localTracks.filter(Boolean),
  weeklyJam.title,
  path,
);

const playlistPath = join(path, "listenbrainz-weekly-jam.m3u");
await writeFile(playlistPath, m3u, { encoding: "utf-8" });
console.log(playlistPath);
