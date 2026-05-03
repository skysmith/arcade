#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const CONFIG_PATH = path.resolve(import.meta.dirname, "voice-lines.json");
const LOCAL_ENV_PATH = path.resolve(import.meta.dirname, "../.env");
const API_URL = "https://api.openai.com/v1/audio/speech";

function parseArgs(argv) {
  const options = {
    force: false,
    dryRun: false,
    model: null,
    voice: null,
    format: null,
    envPath: LOCAL_ENV_PATH,
    only: null,
  };

  for (const arg of argv) {
    if (arg === "--force") {
      options.force = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--model=")) {
      options.model = arg.slice("--model=".length);
    } else if (arg.startsWith("--voice=")) {
      options.voice = arg.slice("--voice=".length);
    } else if (arg.startsWith("--format=")) {
      options.format = arg.slice("--format=".length);
    } else if (arg.startsWith("--env=")) {
      options.envPath = path.resolve(process.cwd(), arg.slice("--env=".length));
    } else if (arg.startsWith("--only=")) {
      options.only = new Set(arg.slice("--only=".length).split(",").map((item) => item.trim()).filter(Boolean));
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function slugify(id) {
  return id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function loadEnv(filePath) {
  let raw;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex <= 0) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
  return true;
}

async function exists(filePath) {
  try {
    await readFile(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function createSpeech({ apiKey, model, voice, format, instructions, text }) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      instructions,
      response_format: format,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Speech request failed (${response.status}): ${body}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await loadEnv(options.envPath);
  const config = await readJson(CONFIG_PATH);
  const apiKey = process.env.OPENAI_API_KEY;
  const model = options.model || config.model || "gpt-4o-mini-tts";
  const format = options.format || config.format || "mp3";
  const outputDir = path.resolve(ROOT, config.outputDir);
  const manifestPath = path.resolve(ROOT, config.manifestPath);
  const manifestDir = path.dirname(manifestPath);
  const manifestBase = path.dirname(manifestPath);
  const characters = config.characters || {};

  if (!apiKey && !options.dryRun) {
    throw new Error(`OPENAI_API_KEY is required. Add it to ${path.relative(ROOT, options.envPath)} or pass --dry-run.`);
  }

  await mkdir(outputDir, { recursive: true });
  await mkdir(manifestDir, { recursive: true });

  const clips = {};
  const selectedClips = config.clips.filter((clip) => !options.only || options.only.has(clip.id) || options.only.has(clip.characterId));

  for (const clip of selectedClips) {
    const character = characters[clip.characterId] || {};
    const clipVoice = options.voice || clip.voice || character.voice || config.voice || "nova";
    const instructions = clip.instructions || character.instructions || config.instructions;
    const filename = `${slugify(clip.id)}.${format}`;
    const outputPath = path.join(outputDir, filename);
    const manifestFile = path.relative(manifestBase, outputPath).split(path.sep).join("/");
    clips[clip.id] = {
      text: clip.text,
      file: manifestFile,
      characterId: clip.characterId || null,
      characterName: character.name || null,
      voice: clipVoice,
    };

    if (options.dryRun) {
      console.log(`[dry-run] ${clip.id} (${clipVoice}) -> ${path.relative(ROOT, outputPath)}`);
      continue;
    }

    if (!options.force && await exists(outputPath)) {
      console.log(`skip ${path.relative(ROOT, outputPath)}`);
      continue;
    }

    console.log(`generate ${clip.id} (${clipVoice})`);
    const audio = await createSpeech({
      apiKey,
      model,
      voice: clipVoice,
      format,
      instructions,
      text: clip.text,
    });
    await writeFile(outputPath, audio);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    disclosure: "Voice clips are AI-generated character performances.",
    model,
    format,
    characters: Object.fromEntries(Object.entries(characters).map(([id, character]) => [id, {
      name: character.name,
      voice: character.voice,
    }])),
    clips,
  };

  if (options.dryRun) {
    console.log(`[dry-run] manifest -> ${path.relative(ROOT, manifestPath)}`);
    return;
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`wrote ${path.relative(ROOT, manifestPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
