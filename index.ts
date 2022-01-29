import youtubeDlExec, { download } from "@distube/youtube-dl";
import { DisTubeError, ExtractorPlugin, Playlist, Song } from "distube";
import type { OtherSongInfo } from "distube";
import type { GuildMember } from "discord.js";
import type { YtResponse } from "@distube/youtube-dl";

export class YtDlpPlugin extends ExtractorPlugin {
  constructor() {
    super();
    download().catch(() => undefined);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate() {
    return true;
  }

  async resolve(url: string, { member, metadata }: { member?: GuildMember; metadata?: any }) {
    const info: any = await youtubeDlExec(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      preferFreeFormats: true,
    }).catch(e => {
      throw new DisTubeError("YTDLP_ERROR", `${e.stderr || e}`);
    });
    if (Array.isArray(info.entries) && info.entries.length > 0) {
      info.source = info.extractor.match(/\w+/)[0];
      info.songs = info.entries.map(
        (i: OtherSongInfo & YtResponse) => new Song(i, { member, source: i.extractor, metadata }),
      );
      return new Playlist(info, { member, metadata, properties: { source: info.songs[0]?.source } });
    }
    return new Song(info, { member, source: info.extractor, metadata });
  }
  async getStreamURL(url: string) {
    const info = await youtubeDlExec(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      preferFreeFormats: true,
    }).catch(e => {
      throw new DisTubeError("YTDLP_ERROR", `${e.stderr || e}`);
    });
    return info.url;
  }
}

export const YouTubeDLPlugin = YtDlpPlugin;
