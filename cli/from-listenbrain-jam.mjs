#!/usr/bin/env node
// @ts-check
import { search } from "music-metadata-search";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { generateM3uPlaylist } from "../lib.mjs";

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
  const index = tracks.indexOf(track.musicbrainzRecordingId);
  if (index === -1) continue;
  localTracks[index] = track;
}
const m3u = generateM3uPlaylist(
  localTracks.filter(Boolean),
  weeklyJam.title,
  path,
);

const playlistPath = join(path, "listenbrainz-weekly-jam.m3u");
await writeFile(playlistPath, m3u, { encoding: "utf-8" });
console.log(playlistPath);

async function getWeeklyJam() {
  const res = await fetch(
    "https://api.listenbrainz.org/1/user/madeindjs/playlists/createdfor",
  );
  if (!res.ok) throw Error();
  const { playlists } = await res.json();
  return playlists
    .map((p) => p.playlist)
    .find((playlist) => {
      return (
        playlist.extension["https://musicbrainz.org/doc/jspf#playlist"]
          .additional_metadata.algorithm_metadata.source_patch === "weekly-jams"
      );
    });
}

/** @returns {Promise<string[]>} */
async function getPlaylistTracks(id) {
  const res = await fetch(`https://api.listenbrainz.org/1/playlist/${id}`);
  if (!res.ok) throw Error();
  const data = await res.json();
  return data.playlist.track.map((t) =>
    t.identifier.at(0).replace("https://musicbrainz.org/recording/", ""),
  );
}
