export async function getWeeklyJam() {
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
export async function getPlaylistTracks(id) {
  const res = await fetch(`https://api.listenbrainz.org/1/playlist/${id}`);
  if (!res.ok) throw Error();
  const data = await res.json();
  return data.playlist.track.map((t) =>
    t.identifier.at(0).replace("https://musicbrainz.org/recording/", ""),
  );
}
