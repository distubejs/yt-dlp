import dargs from "dargs";
import execa from "execa";
import mkdirp from "mkdirp";
import petitio from "petitio";
import fs from "node:fs/promises";
import { YTDLP_DIR, YTDLP_FILENAME, YTDLP_PATH, YTDLP_URL } from "./env";
import type { YtDlpFlags, YtDlpResponse } from "./type";

const makeRequest = async (url: string): Promise<petitio.PetitioResponse> => {
  const response = await petitio(url).header({ "user-agent": "distube" }).send();
  if (!response.statusCode) throw new Error(`Cannot make requests to '${url}'`);
  if (response.statusCode.toString().startsWith("3")) return makeRequest(response.headers.location);
  if (response.statusCode.toString().startsWith("2")) return response;
  throw new Error(`${url}\nStatus code ${response.statusCode.toString()}`);
};

const args = (url: string, flags = {}) => [url].concat(dargs(flags, { useEquals: false })).filter(Boolean);

export const raw = (url: string, flags?: YtDlpFlags, options?: execa.Options<string>) =>
  execa(YTDLP_PATH, args(url, flags), options);

export const json = (url: string, flags?: YtDlpFlags, options?: execa.Options<string>): Promise<YtDlpResponse> =>
  raw(url, flags, options).then(({ stdout }) => JSON.parse(stdout));

const binContentTypes = ["binary/octet-stream", "application/octet-stream", "application/x-binary"];
const getBinary = async (url: string) => {
  const response = await makeRequest(url);
  const contentType = response.headers["content-type"];

  if (binContentTypes.includes(contentType)) return { buffer: response.body, version: "N/A" };

  const [{ assets, tag_name }] = response.json();
  const { browser_download_url } = assets.find(({ name }: { name: string }) => name === YTDLP_FILENAME);
  return makeRequest(browser_download_url).then(r => ({
    buffer: r.body,
    version: typeof tag_name === "string" ? tag_name : "N/A",
  }));
};

export const download = () =>
  Promise.all([getBinary(YTDLP_URL), mkdirp(YTDLP_DIR)]).then(([{ buffer, version }]) => {
    fs.writeFile(YTDLP_PATH, buffer, { mode: 493 });
    return version;
  });
