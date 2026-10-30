import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setConcurrency(4);
// Düz renkli çizimlerde 21 gözle fark edilmez, dosya boyutunu yaklaşık yarıya indirir.
Config.setCrf(21);

// Remotion normalde kendi tarayıcısını indirir. İndirme engelliyse (ör. bulut ortamı)
// kurulu bir Chrome Headless Shell yolunu bu değişkenle verin.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
