import { download, json } from "./wrapper";
import { DisTubeError, ExtractorPlugin, Playlist, Song } from "distube";
import type { YtDlpPlaylist } from "./type";
import type { PlaylistInfo } from "distube";
import type { GuildMember } from "discord.js";

const isPlaylist = (i: any): i is YtDlpPlaylist => Array.isArray(i.entries);

export class YtDlpPlugin extends ExtractorPlugin {
  constructor() {
    super();
    download().catch(() => undefined);
  }

  validate() {
    return true;
  }

  async resolve<T>(url: string, { member, metadata }: { member?: GuildMember; metadata?: T }) {
    const info = await json(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true,
    }).catch(e => {
      throw new DisTubeError("YTDLP_ERROR", `${e.stderr || e}`);
    });
    if (isPlaylist(info)) {
      if (info.entries.length === 0) throw new DisTubeError("YTDLP_ERROR", "The playlist is empty");
      const playlist: PlaylistInfo = {
        ...info,
        source: info.extractor,
        songs: info.entries.map(i => new Song(i, { member, source: i.extractor, metadata })),
      };
      return new Playlist(playlist, { member, metadata });
    }
    return new Song(info, { member, source: info.extractor, metadata });
  }

  async getStreamURL(url: string) {
    const info = await json(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true,
      format: "ba/ba*",
    }).catch(e => {
      throw new DisTubeError("YTDLP_ERROR", `${e.stderr || e}`);
    });
    if (isPlaylist(info)) throw new DisTubeError("YTDLP_ERROR", "Cannot get stream URL of a entire playlist");
    return info.url;
  }
}
