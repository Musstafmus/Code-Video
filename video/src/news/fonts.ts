import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import { continueRender, delayRender } from "remotion";

// Yazı tipi yüklenmeden kare çekilirse ilk karelerde yedek font görünür.
const handle = delayRender("Montserrat yükleniyor");
Promise.all(
  ["600", "800", "900"].map((w) => document.fonts.load(`${w} 40px Montserrat`, "ĞÜŞİÖÇğüşıöç")),
).then(() => continueRender(handle));
