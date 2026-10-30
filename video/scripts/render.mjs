// Bir denemeyi uçtan uca üretir: hazırlık -> ses analizi -> Remotion render -> MP4.
// Kullanım: npm run render -- deneme-1
//
// Deneme klasöründe sahneler.json varsa haber formatı (HaberVideo), yoksa
// basit karakter videosu (KarakterVideo) üretilir.
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
const inDeneme = (f) => path.join(denemeDir, f);
const audioName = AUDIO_NAMES.find((f) => fs.existsSync(inDeneme(f)));
if (!audioName) {
  console.error(`${denemeDir} içinde ${AUDIO_NAMES.join(" veya ")} bulunamadı.`);
  process.exit(1);
}
const isNews = fs.existsSync(inDeneme("sahneler.json"));

const publicDir = path.join(videoDir, "public", "denemeler", name);
fs.mkdirSync(publicDir, { recursive: true });
for (const f of [audioName, "sahneler.json", "karakter.json"]) {
  if (fs.existsSync(inDeneme(f))) fs.copyFileSync(inDeneme(f), path.join(publicDir, f));
}

const run = (cmd, args) => execFileSync(cmd, args, { cwd: videoDir, stdio: "inherit" });

if (isNews) {
  console.log("Karakter katmanları");
  run("python3", ["scripts/karakter_hazirla.py", denemeDir, path.join(publicDir, "karakter")]);
}

console.log("Ses analizi");
const textArgs = fs.existsSync(inDeneme("metin.txt")) ? ["--metin", inDeneme("metin.txt")] : [];
run("python3", ["scripts/analiz.py", inDeneme(audioName), path.join(publicDir, "analiz.json"), ...textArgs]);

console.log("Render");
const label = name.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
const composition = isNews ? "HaberVideo" : "KarakterVideo";
const props = JSON.stringify({ deneme: name, audioFile: audioName, label });
run("npx", ["remotion", "render", "src/index.ts", composition, inDeneme(`${name}.mp4`), `--props=${props}`]);
