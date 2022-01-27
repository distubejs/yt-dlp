import youtubeDlExec, { download } from "@distube/youtube-dl";
import { ExtractorPlugin, Playlist, Song } from "distube";
import type { OtherSongInfo } from "distube";
import type { GuildMember } from "discord.js";
import type { YtResponse } from "@distube/youtube-dl";

export class YouTubeDLPlugin extends ExtractorPlugin {
  constructor(updateYouTubeDL = true) {
    super();
    if (updateYouTubeDL) {
      /* eslint-disable no-console */
      download()
        .then((version: any) => console.log(`[DisTube] Updated youtube-dl to ${version}!`))
        .catch(console.error)
        .catch(() => console.warn("[DisTube] Unable to update youtube-dl, using default version."));
      /* eslint-enable no-console */
    }
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
      throw new Error(`[youtube-dl] ${e.stderr || e}`);
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
      throw new Error(`[youtube-dl] ${e.stderr || e}`);
    });
    return info.url;
  }
}
