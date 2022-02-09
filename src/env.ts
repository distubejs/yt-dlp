import path from "path";

const e = (key: string) => process.env[key];

export const YTDLP_DISABLE_DOWNLOAD = !!e("YTDLP_DISABLE_DOWNLOAD");
export const YTDLP_URL = e("YTDLP_URL") || "https://api.github.com/repos/yt-dlp/yt-dlp/releases?per_page=1";
export const YTDLP_IS_WINDOWS = e("YTDLP_IS_WINDOWS") || process.platform === "win32";
export const YTDLP_DIR = e("YTDLP_DIR") || path.join(__dirname, "..", "bin");
export const YTDLP_FILENAME = e("YTDLP_FILENAME") || `yt-dlp${YTDLP_IS_WINDOWS ? ".exe" : ""}`;
export const YTDLP_PATH = path.join(YTDLP_DIR, YTDLP_FILENAME);

export default { YTDLP_DIR, YTDLP_FILENAME, YTDLP_URL, YTDLP_PATH, YTDLP_IS_WINDOWS, YTDLP_DISABLE_DOWNLOAD };
