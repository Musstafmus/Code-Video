import { Gundem, Zirve } from "./agenda";
import { Borsa, Dolar, Fon } from "./economy";
import { Kopru, Takvim, Yil50 } from "./history";
import { Bulten, Enerji, Gunaydin, Spiker } from "./intro";
import { VisualProps } from "./kit";
import { Kayip, Teknoloji, YapayZeka } from "./tech";

/** sahneler.json'daki "gorsel" adları -> çizim bileşenleri */
export const VISUALS: Record<string, React.FC<VisualProps>> = {
  gunaydin: Gunaydin,
  spiker: Spiker,
  enerji: Enerji,
  bulten: Bulten,
  takvim: Takvim,
  yil50: Yil50,
  kopru: Kopru,
  gundem: Gundem,
  zirve: Zirve,
  borsa: Borsa,
  dolar: Dolar,
  fon: Fon,
  teknoloji: Teknoloji,
  yapayZeka: YapayZeka,
  kayip: Kayip,
};
