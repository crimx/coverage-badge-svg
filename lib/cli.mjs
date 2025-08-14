#!/usr/bin/env node

import { badgen } from "badgen";
import fg from "fast-glob";
import { existsSync } from "fs";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join, isAbsolute, dirname } from "path";
import { cwd } from "process";
import sade from "sade";
import { fileURLToPath } from "url";

async function main() {
  const __dirname = fileURLToPath(new URL(".", import.meta.url));
  const pkg = await readFile(join(__dirname, "../package.json"), "utf-8").then(JSON.parse);
  sade(pkg.name, true)
    .version(pkg.version)
    .option("--file, -f", "Coverage summary JSON file", "coverage-summary.json")
    .option("--out, -o", "Output directory path for the SVG badges.", "./docs/coverage-badges")
    .action(start)
    .parse(process.argv);
}

async function start(args) {
  const cwdPath = cwd();

  const outDirPath = isAbsolute(args.out) ? args.out : join(cwdPath, args.out);

  const packagePaths = await fg.glob("**/package.json", {
    onlyFiles: true,
    dot: true,
    absolute: true,
    ignore: ["**/node_modules"],
  });

  if (packagePaths.length === 0) {
    console.error("No package.json files found in the current directory or its subdirectories.");
    return;
  }

  const badgeStrings = await Promise.allSettled(
    packagePaths.map(async pkgPath => {
      const summaryFiles = await fg.glob(`**/${args.file}`, {
        cwd: dirname(pkgPath),
        onlyFiles: true,
        dot: true,
        absolute: true,
        ignore: ["**/node_modules"],
      });

      if (!summaryFiles[0]) return null;

      const coverage = await getCoverage(summaryFiles[0]);
      const status = coverage >= 0 && Number.isFinite(coverage) ? `${coverage}%` : "unknown";
      const color = Number.isFinite(coverage) ? (coverage >= 80 ? "green" : coverage >= 60 ? "orange" : "red") : "red";

      const badgeString = badgen({ label: "coverage", status, color });

      return badgeString;
    }),
  );

  if (badgeStrings.every(badge => !badge.status === "fulfilled" || !badge.value)) {
    console.error("No valid coverage json summary data found in the specified files.");
    return;
  }

  if (!existsSync(outDirPath)) {
    await mkdir(outDirPath, { recursive: true });
  }

  for (let i = 0; i < badgeStrings.length; i++) {
    if (badgeStrings[i].status === "fulfilled") {
      const badgeString = badgeStrings[i].value;
      if (badgeString) {
        const pkg = await tryReadJSON(packagePaths[i]);
        if (pkg && pkg.name) {
          const svgPath = join(outDirPath, `${pkg.name}.svg`);
          await writeFile(svgPath, badgeString);
          console.log(`SVG badges generated at: ${svgPath}`);
        }
      }
    }
  }
}

main().catch(console.error);

async function getCoverage(filePath) {
  const summary = await tryReadJSON(filePath);
  if (summary) {
    return Math.min(
      ...Object.values(summary.total)
        .filter(total => typeof total.pct === "number")
        .map(total => total.pct),
    );
  }
  return NaN;
}

async function tryReadJSON(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}
