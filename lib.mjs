// @ts-check
import fs from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { search } from "music-metadata-search";

/**
 * @param {string} path
 */
export async function findExistingTags(path) {
  const tracks = await search(path, {
    where: "comment IS NOT NULL OR genre IS NOT NULL",
  });
  const comments = new Set(
    tracks.flatMap((t) => [t.comment, t.genre]).filter(Boolean),
  );

  const tagRegex = /#(([A-z]+-?)+)/g;
  const tags = new Set();
  for (const c of comments) {
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
  for (const track of tracks) {
    const trackPath = `.${sep}${relative(path, track.path)}`;
    rows.push(`#EXTINF:0,${track.artist} - ${track.title}`, trackPath, "");
  }
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
    const [tracksComments, tracksGenre] = await Promise.all([
      search(path, { comment: tag }),
      search(path, { genre: tag }),
    ]);

    const tracks = [...tracksComments, ...tracksGenre];

    const playlist = generateM3uPlaylist(tracks, tag, path);
    const playlistPath = join(path, `${tag}.m3u`);

    await fs.writeFile(playlistPath, playlist, { encoding: "utf-8" });
  }
}
