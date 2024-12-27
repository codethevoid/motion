import { Hero } from "@/components/landing/hero";
import { CoinSpotlight } from "@/components/landing/coin-spotlight";
import { Tools } from "@/components/landing/tools";

const Home = () => {
  return (
    <div className="w-full space-y-24 py-16 max-sm:pt-4">
      <div className="px-4 max-sm:px-0">
        <Hero />
      </div>
      <CoinSpotlight />
      <Tools />
    </div>
  );
};

export default Home;
