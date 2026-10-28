import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Ticker from "@/components/sections/Ticker";
import Statement from "@/components/sections/Statement";
import Choose from "@/components/sections/Choose";
import Products from "@/components/sections/Products";
import Inside from "@/components/sections/Inside";
import BigType from "@/components/sections/BigType";
import Fries from "@/components/sections/Fries";
import Venue from "@/components/sections/Venue";
import Collage from "@/components/sections/Collage";
import Grab from "@/components/sections/Grab";
import Manifesto from "@/components/sections/Manifesto";
import Wordmark from "@/components/sections/Wordmark";
import Cta from "@/components/sections/Cta";
import Footer from "@/components/sections/Footer";
import Reveals from "@/components/Reveals";

export default function Home() {
  return (
    <>
      <a href="#contenido" className="skip">
        Saltar al contenido
      </a>
      <Nav />
      <main id="contenido" tabIndex={-1}>
        <Hero />
        <Ticker />
        <Statement />
        <Choose />
        <Products />
        <Inside />
        <BigType />
        <Fries />
        <Venue />
        <Collage />
        <Grab />
        <Manifesto />
        <Wordmark />
        <Cta />
      </main>
      <Footer />
      <Reveals />
    </>
  );
}
