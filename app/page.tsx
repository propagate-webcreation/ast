import HomeHero from "./components/home/HomeHero";
import HomeLineCta from "./components/home/HomeLineCta";
import HomeConcerns from "./components/home/HomeConcerns";
import HomeFeatures from "./components/home/HomeFeatures";

import HomeMethod from "./components/home/HomeMethod";
import HomeProfile from "./components/home/HomeProfile";
import HomePricing from "./components/home/HomePricing";
import HomeSupport from "./components/home/HomeSupport";
import HomeTestimonials from "./components/home/HomeTestimonials";
import HomeFaq from "./components/home/HomeFaq";
import HomeLineOffer from "./components/home/HomeLineOffer";
import HomeFooterCta from "./components/home/HomeFooterCta";
import HomePitfallsDetail from "./components/home/HomePitfallsDetail";

export default function Home() {
  return (
    <main>
      <HomeHero />
      <HomeLineCta />
      <HomeConcerns />
      <HomeFeatures />
      <HomeLineCta id="line-cta-2" />
      <HomePitfallsDetail />
      <HomeMethod />
      <HomeSupport />
      <HomeLineCta id="line-cta-3" />
      <HomeProfile />
      <HomePricing />
      <HomeLineOffer />
      <HomeTestimonials />
      <HomeFaq />
      <HomeFooterCta />
    </main>
  );
}