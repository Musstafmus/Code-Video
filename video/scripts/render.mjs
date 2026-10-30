// Bir denemeyi uçtan uca üretir: ses analizi -> Remotion render -> MP4.
// Kullanım: npm run render -- deneme-1
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const AUDIO_NAMES = ["ses.wav", "ses.mp3"];

const name = process.argv[2];
if (!name) {
  console.error("Kullanım: npm run render -- <deneme-klasörü>   (ör. deneme-1)");
  process.exit(1);
}

const videoDir = path.resolve(import.meta.dirname, "..");
const denemeDir = path.resolve(videoDir, "..", "denemeler", name);
const audioName = AUDIO_NAMES.find((f) => fs.existsSync(path.join(denemeDir, f)));
if (!audioName) {
  console.error(`${denemeDir} içinde ${AUDIO_NAMES.join(" veya ")} bulunamadı.`);
  process.exit(1);
}

const publicDir = path.join(videoDir, "public", "denemeler", name);
fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(path.join(denemeDir, audioName), path.join(publicDir, audioName));

const run = (cmd, args) => execFileSync(cmd, args, { cwd: videoDir, stdio: "inherit" });

console.log("1/2 Ses analizi");
run("python3", ["scripts/analiz.py", path.join(denemeDir, audioName), path.join(publicDir, "analiz.json")]);

console.log("2/2 Render");
const label = name.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
const props = JSON.stringify({ deneme: name, audioFile: audioName, label });
run("npx", ["remotion", "render", "src/index.ts", "KarakterVideo", path.join(denemeDir, `${name}.mp4`), `--props=${props}`]);
