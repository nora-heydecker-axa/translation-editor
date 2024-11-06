// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import * as fs from "node:fs/promises";
import path from "node:path";

type Languages = {
  de: string;
  fr: string;
  it: string;
  en: string;
};

type Data = Record<string, Languages>;

const CP = "/Users/nora/repos/axa-health/convenience-platform";

async function append(result: Data, dirpath: string, lang: keyof Languages) {
  const content = await fs.readFile(path.join(CP, dirpath, `${lang}.json`));
  const all = JSON.parse(content.toString("utf-8"));
  for (const prop of Object.keys(all)) {
    if (!result[prop]) {
      result[prop] = {
        de: "",
        fr: "",
        it: "",
        en: "",
      };
    }

    result[prop][lang] = all[prop];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const dirpath = req.query.path;
  if (typeof dirpath !== "string") {
    throw new Error("bad");
  }

  const result: Data = {};

  await append(result, dirpath, "de");
  await append(result, dirpath, "fr");
  await append(result, dirpath, "it");
  await append(result, dirpath, "en");

  res.status(200).json(result);
}
