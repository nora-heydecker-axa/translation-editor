// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import walk from "ignore-walk";

type Data = string[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const cp = "/Users/nora/repos/axa-health/convenience-platform";

  const all = await walk({
    path: cp,
    ignoreFiles: [".gitignore"],
  });
  const results = all.filter((path) => {
    const p = path.toLowerCase();
    if (p.includes(".git")) {
      return false;
    }
    return (
      p.endsWith("fr.json") ||
      p.endsWith("it.json") ||
      p.endsWith("en.json") ||
      p.endsWith("de.json")
    );
  });

  const projects = new Set<string>();

  for (const result of results) {
    const components = result.split("/");
    const path = components.slice(0, components.length - 1).join("/");
    projects.add(path);
  }

  const projectsSorted = [...projects];
  projectsSorted.sort();

  res.status(200).json(projectsSorted);
}
