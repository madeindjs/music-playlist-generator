// @ts-check
import fs from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { search } from "music-metadata-search";

const tagRegex = /#(([A-z]+-?)+)/g;

/**
 * @param {import('music-metadata-search').Track[]} tracks
 * @param {string} path
 */
function generateM3uPlaylist(tracks, title = "Playlist", path) {
  const rows = ["#EXTM3U", `#PLAYLIST:${title}`, ""];
  for (const track of tracks) {
    const trackPath = `.${sep}${relative(path, track.path)}`;
    rows.push(`#EXTINF:0,${track.artist} - ${track.title}`, trackPath, "");
  }
  return rows.join("\n");
}

/** @param {string} path */
export async function removePlaylists(path) {
  for await (const oldPlaylist of fs.glob(join(path, "#*.m3u"))) {
    await fs.unlink(oldPlaylist);
  }
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
    await fs.writeFile(playlistPath, playlist, { encoding: "utf-8" });
  }
}
