// @ts-check
import fs from "node:fs/promises";
import { join, relative, sep } from "node:path";

/**
 * @param {import('music-metadata-search').Track[]} tracks
 * @param {string} path
 */
export function generateM3uPlaylist(tracks, title = "Playlist", path) {
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
