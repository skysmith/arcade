#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const arcadeRoot = path.resolve(import.meta.dirname, "..");
const gamesRoot = path.resolve(arcadeRoot, "..");
const outputPath = path.join(arcadeRoot, "arcade.connections.json");
const manifestName = "arcade.connection.json";
const ignoredDirNames = new Set([".git", "node_modules", "dist", "build", ".next"]);

async function walkForManifests(rootDir) {
  const manifests = [];

  async function visit(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (ignoredDirNames.has(entry.name)) {
        continue;
      }

      const absolutePath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await visit(absolutePath);
        continue;
      }

      if (entry.isFile() && entry.name === manifestName) {
        manifests.push(absolutePath);
      }
    }
  }

  await visit(rootDir);
  return manifests;
}

async function readManifest(absolutePath) {
  const raw = await fs.readFile(absolutePath, "utf8");
  const manifest = JSON.parse(raw);
  const relativePath = path.relative(arcadeRoot, absolutePath);
  const connectionPath = relativePath.startsWith(".") ? relativePath : `./${relativePath}`;

  return {
    id: String(manifest.id || ""),
    title: String(manifest.title || ""),
    hidden: Boolean(manifest.hidden),
    connectionPath: connectionPath.replaceAll(path.sep, "/"),
  };
}

function compareManifests(left, right) {
  const leftInsideArcade = left.connectionPath.startsWith("./games/");
  const rightInsideArcade = right.connectionPath.startsWith("./games/");

  if (leftInsideArcade !== rightInsideArcade) {
    return leftInsideArcade ? -1 : 1;
  }

  return left.connectionPath.localeCompare(right.connectionPath);
}

async function loadExistingOrder() {
  try {
    const raw = await fs.readFile(outputPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Map();
    }

    return new Map(parsed.map((connectionPath, index) => [connectionPath, index]));
  } catch (_error) {
    return new Map();
  }
}

async function main() {
  const manifestPaths = await walkForManifests(gamesRoot);
  const manifests = await Promise.all(manifestPaths.map(readManifest));
  const existingOrder = await loadExistingOrder();
  const validManifests = manifests
    .filter((manifest) => manifest.id && manifest.title)
    .sort((left, right) => {
      const leftOrder = existingOrder.get(left.connectionPath);
      const rightOrder = existingOrder.get(right.connectionPath);

      if (leftOrder !== undefined || rightOrder !== undefined) {
        if (leftOrder === undefined) return 1;
        if (rightOrder === undefined) return -1;
        return leftOrder - rightOrder;
      }

      return compareManifests(left, right);
    });

  const connectionIndex = validManifests.map((manifest) => manifest.connectionPath);
  await fs.writeFile(outputPath, `${JSON.stringify(connectionIndex, null, 2)}\n`);

  const visibleCount = validManifests.filter((manifest) => !manifest.hidden).length;
  const hiddenCount = validManifests.length - visibleCount;

  console.log(`Synced ${validManifests.length} arcade manifests to ${outputPath}`);
  console.log(`Visible cabinets: ${visibleCount}`);
  console.log(`Hidden cabinets: ${hiddenCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
