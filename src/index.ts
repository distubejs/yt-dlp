import { download, json } from "./wrapper";
import { DisTubeError, ExtractorPlugin, Playlist, Song } from "distube";
import type { PlaylistInfo } from "distube";
import type { GuildMember } from "discord.js";
import type { YtDlpOptions, YtDlpPlaylist } from "./type";

const isPlaylist = (i: any): i is YtDlpPlaylist => Array.isArray(i.entries);

export class YtDlpPlugin extends ExtractorPlugin {
  constructor({ update }: YtDlpOptions = {}) {
    super();
    if (update ?? true) download().catch(() => undefined);
  }

  override validate() {
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

  override async getStreamURL(url: string) {
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

export * from "./wrapper";
