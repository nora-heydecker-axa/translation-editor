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
  res: NextApiResponse,
) {
  if (req.method === "GET") {
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
  } else if (req.method === "PATCH") {
    const body = JSON.parse(req.body) as
      | {
          path: string;
          lang: string;
          key: string;
          value: string;
        }
      | {
          path: string;
          key: string;
          newKey: string;
        };

    if ("newKey" in body) {
      for (const lang of ["de", "fr", "it", "en"]) {
        await editFile(body.path, lang, (json) => {
          const old = json[body.key];
          delete json[body.key];
          json[body.newKey] = old;
        });
      }
    } else {
      console.log(
        `patching ${body.path}/${body.lang}/${body.key} to '${body.value}'`,
      );

      await editFile(body.path, body.lang, (json) => {
        json[body.key] = body.value;
      });
    }

    res.status(200).json({
      success: true,
    });
  } else {
    res.status(405).json({
      error: "method not allowed",
    });
  }
}

async function editFile(
  projectPath: string,
  lang: string,
  func: (json: Record<string, string>) => void,
) {
  const filepath = path.join(CP, projectPath, `${lang}.json`);
  const content = await fs.readFile(filepath);
  const json = JSON.parse(content.toString("utf-8"));

  func(json);

  await fs.writeFile(filepath, JSON.stringify(json, null, 2) + "\n");
  console.log(`Writing update to ${filepath}`);
}
