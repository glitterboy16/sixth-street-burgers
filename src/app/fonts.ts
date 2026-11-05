import { Alfa_Slab_One, Anton, Geist, Geist_Mono, Yellowtail } from "next/font/google";

// Las fuentes se declaran una vez y las usan los dos layouts raíz ((es) y [lang]).
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const geist = Geist({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-geist", display: "swap" });
// tipografías del rombo del cartel (WelcomeBadge): caligrafía de "to Fabulous" y letra de las fichas WELCOME
const yellowtail = Yellowtail({ weight: "400", subsets: ["latin"], variable: "--font-yellowtail", display: "swap" });
const alfa = Alfa_Slab_One({ weight: "400", subsets: ["latin"], variable: "--font-alfa", display: "swap" });
const geistMono = Geist_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const fontClass = `${anton.variable} ${geist.variable} ${geistMono.variable} ${yellowtail.variable} ${alfa.variable}`;
