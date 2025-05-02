# music-playlist-generator

[![npm version](https://badge.fury.io/js/music-playlist-generator.svg)](https://badge.fury.io/js/music-playlist-generator)

Generate M3u playlists from your local library using the hashtags contained in the comment section or in the genre in music's metadata.

This script relies on my library [`music-metadata-search`](https://www.npmjs.com/package/music-metadata-search). It'll scan all audio files and extract their metadata (ID3v1, ID3v2, APE, Vorbis, and iTunes/MP4 tags). Then it gets the hashtags, and creates playlists for all of them.

For instance, let's say your music `./2Pac/2001 -  All Eyez on Me/01. Ambitionz az a Ridah.flac` contains a comment with `#party`, it'll generate a M3u file named `#party.m3u`containing a reference to this track:

```m3u
#EXTM3U
#PLAYLIST:#party

#EXTINF:0,2Pac - Ambitionz az a Ridah
./2Pac/2001 -  All Eyez on Me/01. Ambitionz az a Ridah.flac
```

## Usage

```sh
npm install -g music-playlist-generator
music-playlist-generator ~/Music
```

## Why ?

I have a big music library with files of different formats (`.mp3`, `.flac`, `.m4a`, etc..), and I wanted a way to handle dynamic playlists from anywhere (Android, MacOS, Linux). Using this script, I just have to edit the file's metadata, add a hashtag in the comment, and run it.
