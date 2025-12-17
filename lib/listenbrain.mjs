// @ts-check
import { search } from "music-metadata-search";

export async function getWeeklyJam(user = "madeindjs") {
  const res = await fetch(
    `https://api.listenbrainz.org/1/user/${user}/playlists/createdfor`,
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

/** @returns {Promise<Record<'recordId' | 'album' | 'author' | 'title', string>[]>} */
export async function getPlaylistTracks(id) {
  const res = await fetch(`https://api.listenbrainz.org/1/playlist/${id}`);
  if (!res.ok) throw Error();
  const data = await res.json();
  return data.playlist.track.map((t) => {
    const recordId = t.identifier
      .at(0)
      .replace("https://musicbrainz.org/recording/", "");

    return { recordId, album: t.album, author: t.creator, title: t.title };
  });
}

/**
 * @param {string} path
 * @param {string} playlistId
 */
export async function searchTracksFromListenBrainzPlaylist(path, playlistId) {
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

  return localTracks;
}
