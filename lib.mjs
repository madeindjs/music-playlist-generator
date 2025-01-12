// @ts-check
import fs from "node:fs/promises";
import { join } from "node:path";
import { search } from "music-metadata-search";

/**
 * @param {string} path
 */
export async function findExistingTags(path) {
  const tracks = await search(path, { where: "comment IS NOT NULL" });
  const comments = new Set(tracks.map((t) => t.comment).filter(Boolean));

  const tagRegex = /#(([A-z]+-?)+)/g;
  const tags = new Set();
  for (const c of comments) {
    if (c === null) continue;
    for (const match of c.matchAll(tagRegex)) tags.add(match[0]);
  }

  return tags;
}

/**
 * @param {Awaited<ReturnType<typeof search>>} tracks
 * @param {string} path
 */
function generateM3uPlaylist(tracks, title = "Playlist", path) {
  const rows = ["#EXTM3U", `#PLAYLIST:${title}`, ""];
  for (const track of tracks)
    rows.push(
      `#EXTINF:0,${track.artist} - ${track.title}`,
      track.path.replace(path, "."),
      "",
    );
  return rows.join("\n");
}

/**
 * @param {string} path
 */
export async function removePlaylists(path) {
  for await (const oldPlaylist of fs.glob(join(path, "#*.m3u"))) {
    await fs.unlink(oldPlaylist);
  }
}

/**
 * @param {string} path
 */
export async function generatePlaylists(path) {
  const tags = await findExistingTags(path);

  for (const tag of tags) {
    const tracks = await search(path, { comment: tag });

    const playlist = generateM3uPlaylist(tracks, tag, path);
    const playlistPath = join(path, `${tag}.m3u`);

    await fs.writeFile(playlistPath, playlist, { encoding: "utf-8" });
  }
}
